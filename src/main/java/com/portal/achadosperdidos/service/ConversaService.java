package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.ConversaDto;
import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.ConversaRepository;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.MensagemRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConversaService {

    private final ConversaRepository conversaRepository;
    private final MensagemRepository mensagemRepository;
    private final ItemRepository itemRepository;
    private final ReivindicacaoRepository reivindicacaoRepository;
    private final AcessoService acesso;

    /**
     * O interessado inicia (ou retoma) a conversa com o dono do item.
     * Só é possível iniciar conversa em itens ABERTOS ou EM_NEGOCIACAO.
     */
    @Transactional
    public ConversaDto.Response iniciar(Long usuarioId, Long itemId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        Item item = itemRepository.findDetalhadoById(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));

        if (item.getStatus() != StatusItem.ABERTO && item.getStatus() != StatusItem.EM_NEGOCIACAO) {
            throw new RegraNegocioException("Este item não aceita novas conversas (status: " + item.getStatus() + ")");
        }

        Usuario interessado;
        if (item.getUsuario().getId().equals(usuarioId)) {
            if (item.getStatus() != StatusItem.EM_NEGOCIACAO) {
                throw new RegraNegocioException("A conversa do proprietário é liberada após aceitar uma reivindicação");
            }
            interessado = reivindicacaoRepository.findByItemIdAndStatus(itemId, StatusReivindicacao.ACEITA)
                    .map(r -> r.getReivindicante())
                    .orElseThrow(() -> new RegraNegocioException("Não há uma reivindicação aceita para este item"));
        } else {
            interessado = usuario;
        }

        Conversa conversa = conversaRepository.findByItemIdAndInteressadoId(itemId, interessado.getId())
                .orElseGet(() -> {
                    Conversa c = new Conversa();
                    c.setItem(item);
                    c.setDonoItem(item.getUsuario());
                    c.setInteressado(interessado);
                    return conversaRepository.save(c);
                });

        return ConversaDto.Response.de(conversa, naoLidas(conversa.getId(), usuarioId));
    }

    public List<ConversaDto.Response> listarDoUsuario(Long usuarioId) {
        acesso.usuarioAtivo(usuarioId);
        return conversaRepository.findDoUsuario(usuarioId).stream()
                .map(c -> ConversaDto.Response.de(c, naoLidas(c.getId(), usuarioId)))
                .toList();
    }

    public ConversaDto.Response buscar(Long usuarioId, Long conversaId) {
        Conversa c = carregarComoParticipante(usuarioId, conversaId);
        return ConversaDto.Response.de(c, naoLidas(conversaId, usuarioId));
    }

    /** Carrega a conversa garantindo que o usuário é um dos dois participantes. */
    public Conversa carregarComoParticipante(Long usuarioId, Long conversaId) {
        Usuario u = acesso.usuarioAtivo(usuarioId);
        Conversa c = conversaRepository.findDetalhadoById(conversaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conversa", conversaId));
        if (!c.participa(u)) {
            throw new AcessoNegadoException("Você não participa desta conversa");
        }
        return c;
    }

    private long naoLidas(Long conversaId, Long usuarioId) {
        return mensagemRepository.countByConversaIdAndLidaFalseAndRemetenteIdNot(conversaId, usuarioId);
    }
}
