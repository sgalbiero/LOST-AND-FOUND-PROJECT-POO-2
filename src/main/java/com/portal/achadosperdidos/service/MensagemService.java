package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.MensagemDto;
import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Mensagem;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.repository.MensagemRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final ConversaService conversaService;
    private final AcessoService acesso;

    @Transactional
    public MensagemDto.Response enviar(Long usuarioId, Long conversaId, MensagemDto.Enviar req) {
        Conversa conversa = conversaService.carregarComoParticipante(usuarioId, conversaId);
        Usuario remetente = acesso.usuarioAtivo(usuarioId);

        Mensagem m = new Mensagem();
        m.setConversa(conversa);
        m.setRemetente(remetente);
        m.setConteudo(TextoUtil.exigirTexto(req.conteudo(), "conteudo"));
        return MensagemDto.Response.de(mensagemRepository.save(m));
    }

    /** Histórico em ordem cronológica (mais antigas primeiro). */
    public Page<MensagemDto.Response> listar(Long usuarioId, Long conversaId, Pageable pageable) {
        conversaService.carregarComoParticipante(usuarioId, conversaId);
        Pageable p = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 100),
                Sort.by(Sort.Direction.ASC, "dataEnvio"));
        return mensagemRepository.findByConversaId(conversaId, p).map(MensagemDto.Response::de);
    }

    /** Marca como lidas as mensagens que a outra pessoa enviou. Retorna quantas foram atualizadas. */
    @Transactional
    public int marcarComoLidas(Long usuarioId, Long conversaId) {
        conversaService.carregarComoParticipante(usuarioId, conversaId);
        return mensagemRepository.marcarComoLidas(conversaId, usuarioId);
    }

    public long contarNaoLidas(Long usuarioId) {
        acesso.usuarioAtivo(usuarioId);
        return mensagemRepository.contarNaoLidasDoUsuario(usuarioId);
    }
}
