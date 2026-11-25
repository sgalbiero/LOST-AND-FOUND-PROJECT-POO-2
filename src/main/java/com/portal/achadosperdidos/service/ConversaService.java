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
import com.portal.achadosperdidos.repository.MediacaoRepository;
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
    private final MediacaoRepository mediacaoRepository;
    private final AcessoService acesso;
    private final CicloNegociacaoService cicloNegociacao;

    /** O interessado inicia (ou retoma) a conversa depois de reivindicar o item. */
    @Transactional
    public ConversaDto.Response iniciar(Long usuarioId, Long itemId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        Item item = itemRepository.findByIdParaAtualizar(itemId)
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
            var reivindicacao = reivindicacaoRepository.findByItemIdAndReivindicanteId(itemId, usuarioId)
                    .orElseThrow(() -> new RegraNegocioException("Reivindique o item antes de iniciar uma conversa"));
            boolean pendenteEmItemAberto = item.getStatus() == StatusItem.ABERTO
                    && reivindicacao.getStatus() == StatusReivindicacao.PENDENTE;
            boolean aceitaEmNegociacao = item.getStatus() == StatusItem.EM_NEGOCIACAO
                    && reivindicacao.getStatus() == StatusReivindicacao.ACEITA;
            if (!pendenteEmItemAberto && !aceitaEmNegociacao) {
                throw new RegraNegocioException("Esta reivindicação não permite iniciar uma conversa");
            }
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

        return resposta(conversa, usuarioId);
    }

    public List<ConversaDto.Response> listarDoUsuario(Long usuarioId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        if (acesso.isAdmin(usuario)) {
            return mediacaoRepository.findByAdminResponsavelIdAndStatusOrderByDataSolicitacaoDesc(usuarioId, com.portal.achadosperdidos.enums.StatusMediacao.EM_ANDAMENTO).stream()
                    .filter(m -> m.getConversa() != null)
                    .map(m -> ConversaDto.Response.de(m.getConversa(), naoLidas(m.getConversa().getId(), usuarioId), m))
                    .toList();
        }
        return conversaRepository.findDoUsuario(usuarioId).stream()
                .map(c -> resposta(c, usuarioId))
                .toList();
    }

    public List<ConversaDto.Response> listarAbertasParaEquipe(Long usuarioId) {
        acesso.exigirAdmin(usuarioId);
        return conversaRepository.findAbertasParaEquipe().stream()
                .map(c -> resposta(c, usuarioId))
                .toList();
    }

    public ConversaDto.Response buscar(Long usuarioId, Long conversaId) {
        Conversa c = carregarComAcessoMensagens(usuarioId, conversaId);
        return resposta(c, usuarioId);
    }

    /** Registra a confirmação de um participante e encerra somente após a confirmação dos dois. */
    @Transactional
    public ConversaDto.Response solicitarEncerramento(Long usuarioId, Long conversaId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        Item item = bloquearItemDaConversa(conversaId);
        Conversa conversa = buscarConversaParaAtualizar(conversaId);
        if (acesso.isAdmin(usuario)) {
            conversa.encerrarPelaEquipe();
            cicloNegociacao.encerrarSemDevolucao(item, conversa);
            return ConversaDto.Response.de(conversa, 0);
        }
        if (!conversa.participaPorId(usuarioId)) {
            throw new AcessoNegadoException("Você não participa desta conversa");
        }
        conversa.solicitarEncerramento(usuarioId);
        if (conversa.isEncerrada()) cicloNegociacao.encerrarSemDevolucao(item, conversa);
        return ConversaDto.Response.de(conversa, naoLidas(conversaId, usuarioId));
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

    /** Bloqueia item e conversa na ordem global antes de validar o participante. */
    public Conversa carregarComoParticipanteParaAtualizar(Long usuarioId, Long conversaId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        bloquearItemDaConversa(conversaId);
        Conversa conversa = buscarConversaParaAtualizar(conversaId);
        if (!conversa.participa(usuario)) {
            throw new AcessoNegadoException("Você não participa desta conversa");
        }
        return conversa;
    }

    /** Bloqueio interno para casos de uso que já validaram sua própria autorização. */
    public Conversa carregarParaAtualizar(Long conversaId) {
        bloquearItemDaConversa(conversaId);
        return buscarConversaParaAtualizar(conversaId);
    }

    /** Garante que a conversa ainda corresponde a uma reivindicação operacional. */
    public void exigirVinculoAtivo(Conversa conversa) {
        if (conversa.isEncerrada()) {
            throw new RegraNegocioException("Esta conversa já foi encerrada");
        }
        var reivindicacao = reivindicacaoRepository.findByItemIdAndReivindicanteId(
                        conversa.getItem().getId(), conversa.getInteressado().getId())
                .orElseThrow(() -> new RegraNegocioException("A conversa não possui uma reivindicação válida"));
        boolean pendenteEmItemAberto = conversa.getItem().getStatus() == StatusItem.ABERTO
                && reivindicacao.getStatus() == StatusReivindicacao.PENDENTE;
        boolean aceitaEmNegociacao = conversa.getItem().getStatus() == StatusItem.EM_NEGOCIACAO
                && reivindicacao.getStatus() == StatusReivindicacao.ACEITA;
        if (!pendenteEmItemAberto && !aceitaEmNegociacao) {
            throw new RegraNegocioException("Esta conversa não está mais vinculada a uma negociação ativa");
        }
    }

    /** Participantes sempre acessam; o mediador acessa somente a conversa que assumiu e enquanto ela está em atendimento. */
    public Conversa carregarComAcessoMensagens(Long usuarioId, Long conversaId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        Conversa conversa = conversaRepository.findDetalhadoById(conversaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conversa", conversaId));
        if (conversa.participaPorId(usuarioId)) return conversa;
        boolean mediadorResponsavel = acesso.isAdmin(usuario)
                && mediacaoRepository.existsByConversaIdAndAdminResponsavelIdAndStatus(
                conversaId, usuarioId, com.portal.achadosperdidos.enums.StatusMediacao.EM_ANDAMENTO);
        if (!mediadorResponsavel) {
            throw new AcessoNegadoException("Você não tem acesso a esta conversa");
        }
        return conversa;
    }

    /** Versão bloqueante usada por comandos que enviam mensagem ou alteram o atendimento. */
    public Conversa carregarComAcessoMensagensParaAtualizar(Long usuarioId, Long conversaId) {
        Usuario usuario = acesso.usuarioAtivo(usuarioId);
        bloquearItemDaConversa(conversaId);
        Conversa conversa = buscarConversaParaAtualizar(conversaId);
        if (conversa.participaPorId(usuarioId)) return conversa;
        boolean mediadorResponsavel = acesso.isAdmin(usuario)
                && mediacaoRepository.existsByConversaIdAndAdminResponsavelIdAndStatus(
                conversaId, usuarioId, com.portal.achadosperdidos.enums.StatusMediacao.EM_ANDAMENTO);
        if (!mediadorResponsavel) {
            throw new AcessoNegadoException("Você não tem acesso a esta conversa");
        }
        return conversa;
    }

    private long naoLidas(Long conversaId, Long usuarioId) {
        return mensagemRepository.countByConversaIdAndLidaFalseAndRemetenteIdNot(conversaId, usuarioId);
    }

    private ConversaDto.Response resposta(Conversa conversa, Long usuarioId) {
        var mediacao = mediacaoRepository.findFirstByConversaIdAndStatusInOrderByDataSolicitacaoDesc(
                conversa.getId(), java.util.EnumSet.of(
                        com.portal.achadosperdidos.enums.StatusMediacao.PENDENTE,
                        com.portal.achadosperdidos.enums.StatusMediacao.EM_ANDAMENTO)).orElse(null);
        return ConversaDto.Response.de(conversa, naoLidas(conversa.getId(), usuarioId), mediacao);
    }

    private Item bloquearItemDaConversa(Long conversaId) {
        Long itemId = conversaRepository.findItemIdById(conversaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conversa", conversaId));
        return itemRepository.findByIdParaAtualizar(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
    }

    private Conversa buscarConversaParaAtualizar(Long conversaId) {
        return conversaRepository.findDetalhadoParaAtualizarById(conversaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conversa", conversaId));
    }
}
