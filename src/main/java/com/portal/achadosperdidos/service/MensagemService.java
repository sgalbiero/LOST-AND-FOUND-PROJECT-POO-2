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
        Conversa conversa = conversaService.carregarComAcessoMensagensParaAtualizar(usuarioId, conversaId);
        conversaService.exigirVinculoAtivo(conversa);
        Usuario remetente = acesso.usuarioAtivo(usuarioId);

        Mensagem m = new Mensagem();
        m.setConversa(conversa);
        m.setRemetente(remetente);
        m.setConteudo(TextoUtil.exigirTexto(req.conteudo(), "conteudo"));
        conversa.registrarAtividade();
        return MensagemDto.Response.de(mensagemRepository.save(m));
    }

    /** Histórico paginado do mais recente para o mais antigo. */
    public Page<MensagemDto.Response> listar(Long usuarioId, Long conversaId, Pageable pageable) {
        conversaService.carregarComAcessoMensagens(usuarioId, conversaId);
        Pageable p = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 100),
                Sort.by(Sort.Direction.DESC, "dataEnvio"));
        return mensagemRepository.findByConversaId(conversaId, p).map(MensagemDto.Response::de);
    }

    /** Marca como lidas as mensagens que a outra pessoa enviou. Retorna quantas foram atualizadas. */
    @Transactional
    public int marcarComoLidas(Long usuarioId, Long conversaId) {
        conversaService.carregarComAcessoMensagens(usuarioId, conversaId);
        return mensagemRepository.marcarComoLidas(conversaId, usuarioId);
    }

    public long contarNaoLidas(Long usuarioId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        if (acesso.isAdmin(usuario)) {
            return conversaService.listarDoUsuario(usuarioId).stream()
                    .mapToLong(com.portal.achadosperdidos.dto.ConversaDto.Response::naoLidas)
                    .sum();
        }
        return mensagemRepository.contarNaoLidasDoUsuario(usuarioId);
    }
}
