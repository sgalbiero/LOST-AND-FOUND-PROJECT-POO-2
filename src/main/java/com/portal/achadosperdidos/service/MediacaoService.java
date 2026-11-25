package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.MediacaoDto;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusMediacao;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.ConflitoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.MediacaoRepository;
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

    private static final Set<StatusMediacao> STATUS_ABERTOS =
            Set.of(StatusMediacao.PENDENTE, StatusMediacao.EM_ANDAMENTO);

    private final MediacaoRepository mediacaoRepository;
    private final AcessoService acesso;
    private final ConversaService conversaService;

    @Transactional
    public MediacaoDto.Response solicitarDaConversa(Long usuarioId, Long conversaId, MediacaoDto.Solicitar req) {
        Usuario solicitante = acesso.usuarioAtivo(usuarioId);
        Conversa conversa = conversaService.carregarComoParticipanteParaAtualizar(usuarioId, conversaId);
        conversaService.exigirVinculoAtivo(conversa);
        Item item = conversa.getItem();
        if (mediacaoRepository.existsByConversaIdAndStatusIn(conversaId, STATUS_ABERTOS)) {
            throw new ConflitoException("Já existe um pedido de ajuda em aberto para esta conversa");
        }
        return criar(solicitante, item, conversa, req);
    }

    private MediacaoDto.Response criar(Usuario solicitante, Item item, Conversa conversa, MediacaoDto.Solicitar req) {
        Mediacao m = new Mediacao();
        m.setItem(item);
        m.setConversa(conversa);
        m.setSolicitante(solicitante);
        m.setMotivo(TextoUtil.exigirTexto(req.motivo(), "motivo"));
        return MediacaoDto.Response.de(mediacaoRepository.save(m));
    }

    @Transactional
    public MediacaoDto.Response assumir(Long adminId, Long mediacaoId) {
        Usuario admin = acesso.exigirAdmin(adminId);
        Contexto contexto = carregarComBloqueio(mediacaoId);
        conversaService.exigirVinculoAtivo(contexto.conversa());
        Mediacao m = contexto.mediacao();
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
        Mediacao m = carregarComBloqueio(mediacaoId).mediacao();
        if (m.getStatus() != StatusMediacao.EM_ANDAMENTO) {
            throw new RegraNegocioException("Só é possível resolver uma mediação em andamento");
        }
        if (m.getAdminResponsavel() == null || !m.getAdminResponsavel().getId().equals(adminId)) {
            throw new AcessoNegadoException("Apenas a pessoa responsável da equipe de apoio pode resolver esta mediação");
        }
        m.resolver(TextoUtil.exigirTexto(req.parecer(), "parecer"));
        return MediacaoDto.Response.de(m);
    }

    /** Fila dos admins: pendentes e em andamento, mais antigas primeiro. */
    public Page<MediacaoDto.Response> listarAbertas(Long adminId, Pageable pageable) {
        acesso.exigirAdmin(adminId);
        Pageable p = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 50),
                Sort.by(Sort.Direction.ASC, "dataSolicitacao"));
        return mediacaoRepository.findByStatusIn(STATUS_ABERTOS, p)
                .map(MediacaoDto.Response::de);
    }

    public List<MediacaoDto.Response> listarMinhas(Long usuarioId) {
        acesso.usuarioAtivo(usuarioId);
        return mediacaoRepository.findBySolicitanteIdOrderByDataSolicitacaoDesc(usuarioId).stream()
                .map(MediacaoDto.Response::de).toList();
    }

    private record Contexto(Mediacao mediacao, Conversa conversa) {
    }

    private Contexto carregarComBloqueio(Long id) {
        Long conversaId = mediacaoRepository.findConversaIdById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mediação", id));
        Conversa conversa = conversaService.carregarParaAtualizar(conversaId);
        Mediacao mediacao = mediacaoRepository.findByIdParaAtualizar(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mediação", id));
        return new Contexto(mediacao, conversa);
    }
}
