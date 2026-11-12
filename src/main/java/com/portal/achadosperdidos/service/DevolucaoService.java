package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.DevolucaoDto;
import com.portal.achadosperdidos.entity.Devolucao;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.DevolucaoRepository;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevolucaoService {

    private final DevolucaoRepository devolucaoRepository;
    private final ReivindicacaoRepository reivindicacaoRepository;
    private final ItemRepository itemRepository;
    private final AcessoService acesso;

    /**
     * Registra a devolução (feita pelo dono do item ou por um admin).
     * Exige item EM_NEGOCIACAO com uma reivindicação ACEITA; encerra o item como DEVOLVIDO
     * e recusa as reivindicações que ainda estavam pendentes.
     */
    @Transactional
    public DevolucaoDto.Response registrar(Long usuarioId, Long itemId, DevolucaoDto.Registrar req) {
        Item item = itemRepository.findByIdParaAtualizar(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
        Usuario ator = acesso.exigirDonoOuAdmin(usuarioId, item);

        if (item.getStatus() != StatusItem.EM_NEGOCIACAO) {
            throw new RegraNegocioException("A devolução só pode ser registrada para itens em negociação");
        }
        if (devolucaoRepository.existsByItemId(itemId)) {
            throw new ConflitoException("Este item já possui uma devolução registrada");
        }
        Reivindicacao aceita = reivindicacaoRepository.findByItemIdAndStatus(itemId, StatusReivindicacao.ACEITA)
                .orElseThrow(() -> new RegraNegocioException("Não há reivindicação aceita para este item"));

        Devolucao d = new Devolucao();
        d.setItem(item);
        d.setReivindicacao(aceita);
        d.setConfirmadoPor(ator);
        d.setObservacao(req == null ? null : TextoUtil.sanitizarTexto(req.observacao()));
        devolucaoRepository.save(d);

        item.setStatus(StatusItem.DEVOLVIDO);
        reivindicacaoRepository.findAllByItemIdAndStatus(itemId, StatusReivindicacao.PENDENTE)
                .forEach(Reivindicacao::recusar);

        return DevolucaoDto.Response.de(d);
    }

    /** Comprovante da devolução, visível ao dono do item, a quem recebeu e a admins. */
    public DevolucaoDto.Response buscarPorItem(Long usuarioId, Long itemId) {
        Devolucao d = devolucaoRepository.findByItemId(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Devolução do item", itemId));
        Usuario u = acesso.usuarioAtivo(usuarioId);
        boolean dono = d.getItem().getUsuario().getId().equals(usuarioId);
        boolean recebedor = d.getReivindicacao().getReivindicante().getId().equals(usuarioId);
        if (!dono && !recebedor && !acesso.isAdmin(u)) {
            throw new AcessoNegadoException("Você não tem permissão para ver esta devolução");
        }
        return DevolucaoDto.Response.de(d);
    }
}
