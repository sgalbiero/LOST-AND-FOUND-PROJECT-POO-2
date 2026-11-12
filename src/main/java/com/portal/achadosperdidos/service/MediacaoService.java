package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.MediacaoDto;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusMediacao;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.ConversaRepository;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.MediacaoRepository;
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
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediacaoService {

    private final MediacaoRepository mediacaoRepository;
    private final ItemRepository itemRepository;
    private final ReivindicacaoRepository reivindicacaoRepository;
    private final ConversaRepository conversaRepository;
    private final AcessoService acesso;

    /** Pedido de ajuda da direção. Só quem está envolvido com o item pode solicitar. */
    @Transactional
    public MediacaoDto.Response solicitar(Long usuarioId, Long itemId, MediacaoDto.Solicitar req) {
        Usuario solicitante = acesso.usuarioAtivo(usuarioId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));

        boolean envolvido = item.getUsuario().getId().equals(usuarioId)
                || reivindicacaoRepository.existsByItemIdAndReivindicanteId(itemId, usuarioId)
                || conversaRepository.findByItemIdAndInteressadoId(itemId, usuarioId).isPresent();
        if (!envolvido) {
            throw new AcessoNegadoException("Apenas pessoas envolvidas com o item podem solicitar mediação");
        }
        if (mediacaoRepository.existsByItemIdAndStatusNot(itemId, StatusMediacao.RESOLVIDO)) {
            throw new ConflitoException("Já existe uma mediação em aberto para este item");
        }

        Mediacao m = new Mediacao();
        m.setItem(item);
        m.setSolicitante(solicitante);
        m.setMotivo(TextoUtil.exigirTexto(req.motivo(), "motivo"));
        return MediacaoDto.Response.de(mediacaoRepository.save(m));
    }

    @Transactional
    public MediacaoDto.Response assumir(Long adminId, Long mediacaoId) {
        Usuario admin = acesso.exigirAdmin(adminId);
        Mediacao m = buscarEntidade(mediacaoId);
        if (m.getStatus() != StatusMediacao.PENDENTE) {
            throw new RegraNegocioException("Esta mediação já foi assumida ou resolvida");
        }
        m.assumir(admin);
        return MediacaoDto.Response.de(m);
    }

    /** Somente o admin responsável pode encerrar a mediação, e o parecer é obrigatório. */
    @Transactional
    public MediacaoDto.Response resolver(Long adminId, Long mediacaoId, MediacaoDto.Resolver req) {
        acesso.exigirAdmin(adminId);
        Mediacao m = buscarEntidade(mediacaoId);
        if (m.getStatus() != StatusMediacao.EM_ANDAMENTO) {
            throw new RegraNegocioException("Só é possível resolver uma mediação em andamento");
        }
        if (m.getAdminResponsavel() == null || !m.getAdminResponsavel().getId().equals(adminId)) {
            throw new AcessoNegadoException("Apenas o administrador responsável pode resolver esta mediação");
        }
        m.resolver(TextoUtil.exigirTexto(req.parecer(), "parecer"));
        return MediacaoDto.Response.de(m);
    }

    /** Fila dos admins: pendentes e em andamento, mais antigas primeiro. */
    public Page<MediacaoDto.Response> listarAbertas(Long adminId, Pageable pageable) {
        acesso.exigirAdmin(adminId);
        Pageable p = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 50),
                Sort.by(Sort.Direction.ASC, "dataSolicitacao"));
        return mediacaoRepository.findByStatusIn(Set.of(StatusMediacao.PENDENTE, StatusMediacao.EM_ANDAMENTO), p)
                .map(MediacaoDto.Response::de);
    }

    public List<MediacaoDto.Response> listarMinhas(Long usuarioId) {
        acesso.usuarioAtivo(usuarioId);
        return mediacaoRepository.findBySolicitanteIdOrderByDataSolicitacaoDesc(usuarioId).stream()
                .map(MediacaoDto.Response::de).toList();
    }

    private Mediacao buscarEntidade(Long id) {
        return mediacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mediação", id));
    }
}
