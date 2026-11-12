package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.ReivindicacaoDto;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReivindicacaoService {

    private final ReivindicacaoRepository reivindicacaoRepository;
    private final ItemRepository itemRepository;
    private final AcessoService acesso;

    /** "É meu" (item ENCONTRADO) ou "eu achei" (item PERDIDO). */
    @Transactional
    public ReivindicacaoDto.Response criar(Long usuarioId, Long itemId, ReivindicacaoDto.Criar req) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));

        if (item.getUsuario().getId().equals(usuarioId)) {
            throw new RegraNegocioException("Você não pode reivindicar o seu próprio item");
        }
        if (item.getStatus() != StatusItem.ABERTO) {
            throw new RegraNegocioException("Este item não está disponível para reivindicação");
        }
        if (reivindicacaoRepository.existsByItemIdAndReivindicanteId(itemId, usuarioId)) {
            throw new ConflitoException("Você já reivindicou este item");
        }

        Reivindicacao r = new Reivindicacao();
        r.setItem(item);
        r.setReivindicante(usuario);
        r.setJustificativa(TextoUtil.exigirTexto(req.justificativa(), "justificativa"));
        return ReivindicacaoDto.Response.de(reivindicacaoRepository.save(r));
    }

    /**
     * Dono aceita a reivindicação: o item passa a EM_NEGOCIACAO.
     * As demais reivindicações pendentes continuam pendentes até a devolução (ou até uma desistência).
     */
    @Transactional
    public ReivindicacaoDto.Response aceitar(Long usuarioId, Long reivindicacaoId) {
        Contexto ctx = carregarComBloqueio(reivindicacaoId);
        Reivindicacao r = ctx.reivindicacao();
        Item item = ctx.item();
        acesso.exigirDonoOuAdmin(usuarioId, item);
        exigirPendente(r);
        if (item.getStatus() != StatusItem.ABERTO) {
            throw new RegraNegocioException("O item não está mais aberto");
        }
        r.aceitar();
        item.setStatus(StatusItem.EM_NEGOCIACAO);
        return ReivindicacaoDto.Response.de(r);
    }

    @Transactional
    public ReivindicacaoDto.Response recusar(Long usuarioId, Long reivindicacaoId) {
        Contexto ctx = carregarComBloqueio(reivindicacaoId);
        Reivindicacao r = ctx.reivindicacao();
        acesso.exigirDonoOuAdmin(usuarioId, ctx.item());
        exigirPendente(r);
        r.recusar();
        return ReivindicacaoDto.Response.de(r);
    }

    /**
     * O reivindicante desiste. Se a reivindicação já havia sido aceita, o item volta a ficar ABERTO.
     */
    @Transactional
    public ReivindicacaoDto.Response cancelar(Long usuarioId, Long reivindicacaoId) {
        acesso.usuarioAtivo(usuarioId);
        Contexto ctx = carregarComBloqueio(reivindicacaoId);
        Reivindicacao r = ctx.reivindicacao();
        Item item = ctx.item();
        if (!r.getReivindicante().getId().equals(usuarioId)) {
            throw new AcessoNegadoException("Apenas quem fez a reivindicação pode cancelá-la");
        }
        if (r.getStatus() != StatusReivindicacao.PENDENTE && r.getStatus() != StatusReivindicacao.ACEITA) {
            throw new RegraNegocioException("Esta reivindicação não pode mais ser cancelada");
        }
        boolean eraAceita = r.getStatus() == StatusReivindicacao.ACEITA;
        r.cancelar();
        if (eraAceita && item.getStatus() == StatusItem.EM_NEGOCIACAO) {
            item.setStatus(StatusItem.ABERTO);
        }
        return ReivindicacaoDto.Response.de(r);
    }

    /** Dono do item (ou admin) vê quem reivindicou e as justificativas. */
    public List<ReivindicacaoDto.Response> listarPorItem(Long usuarioId, Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
        acesso.exigirDonoOuAdmin(usuarioId, item);
        return reivindicacaoRepository.findByItemIdOrderByDataCriacaoAsc(itemId).stream()
                .map(ReivindicacaoDto.Response::de).toList();
    }

    public Page<ReivindicacaoDto.Response> listarMinhas(Long usuarioId, Pageable pageable) {
        acesso.usuarioAtivo(usuarioId);
        Pageable p = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 50),
                Sort.by(Sort.Direction.DESC, "dataCriacao"));
        return reivindicacaoRepository.findByReivindicanteId(usuarioId, p).map(ReivindicacaoDto.Response::de);
    }

    // ------------------------------------------------------------------ internos

    private Reivindicacao buscarEntidade(Long id) {
        return reivindicacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reivindicação", id));
    }

    private record Contexto(Reivindicacao reivindicacao, Item item) {
    }

    /**
     * Ordem importa: primeiro bloqueia o item (SELECT ... FOR UPDATE) e só depois carrega a
     * reivindicação, garantindo que o status lido é o mais recente após qualquer transação concorrente.
     */
    private Contexto carregarComBloqueio(Long reivindicacaoId) {
        Long itemId = reivindicacaoRepository.findItemIdById(reivindicacaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reivindicação", reivindicacaoId));
        Item item = bloquearItem(itemId);
        Reivindicacao r = buscarEntidade(reivindicacaoId);
        return new Contexto(r, item);
    }

    private Item bloquearItem(Long itemId) {
        return itemRepository.findByIdParaAtualizar(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
    }

    private void exigirPendente(Reivindicacao r) {
        if (r.getStatus() != StatusReivindicacao.PENDENTE) {
            throw new RegraNegocioException("A reivindicação já foi respondida (status: " + r.getStatus() + ")");
        }
    }
}
