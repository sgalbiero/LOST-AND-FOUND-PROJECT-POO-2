package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.Conversa;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Mediacao;
import com.portal.achadosperdidos.entity.Reivindicacao;
import com.portal.achadosperdidos.enums.MotivoEncerramentoConversa;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusMediacao;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.repository.ConversaRepository;
import com.portal.achadosperdidos.repository.MediacaoRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumSet;

/**
 * Mantém item, reivindicação, conversa e mediação coerentes na mesma transação do caso de uso.
 * Não abre transações próprias: os serviços de aplicação chamadores definem a fronteira transacional.
 */
@Service
@RequiredArgsConstructor
public class CicloNegociacaoService {

    private static final EnumSet<StatusMediacao> MEDIACOES_ABERTAS =
            EnumSet.of(StatusMediacao.PENDENTE, StatusMediacao.EM_ANDAMENTO);

    private final ConversaRepository conversaRepository;
    private final MediacaoRepository mediacaoRepository;
    private final ReivindicacaoRepository reivindicacaoRepository;

    /** Mantém somente a conversa do reivindicante escolhido operacional. */
    public void reivindicacaoAceita(Reivindicacao aceita) {
        conversaRepository.findAllByItemId(aceita.getItem().getId()).stream()
                .filter(c -> !c.getInteressado().getId().equals(aceita.getReivindicante().getId()))
                .filter(c -> !c.isEncerrada())
                .forEach(c -> encerrarConversa(c, MotivoEncerramentoConversa.OUTRO_REIVINDICANTE_ACEITO));
    }

    /** Encerra o canal ligado a uma reivindicação que deixou de ser válida. */
    public void reivindicacaoFinalizada(Reivindicacao reivindicacao, MotivoEncerramentoConversa motivo) {
        conversaRepository.findByItemIdAndInteressadoId(
                        reivindicacao.getItem().getId(), reivindicacao.getReivindicante().getId())
                .ifPresent(c -> encerrarConversa(c, motivo));
    }

    /** Encerra uma negociação sem entrega e devolve o item ao catálogo quando necessário. */
    public void encerrarSemDevolucao(Item item, Conversa conversa) {
        encerrarSemDevolucao(item, conversa, true);
    }

    /** Encerra a negociação pela equipe, preservando a mediação para conclusão e histórico. */
    public void encerrarPelaEquipeSemDevolucao(Item item, Conversa conversa) {
        encerrarSemDevolucao(item, conversa, false);
    }

    private void encerrarSemDevolucao(Item item, Conversa conversa, boolean cancelarMediacoes) {
        reivindicacaoRepository.findByItemIdAndReivindicanteId(item.getId(), conversa.getInteressado().getId())
                .filter(r -> r.getStatus() == StatusReivindicacao.PENDENTE
                        || r.getStatus() == StatusReivindicacao.ACEITA)
                .ifPresent(r -> {
                    boolean aceita = r.getStatus() == StatusReivindicacao.ACEITA;
                    r.cancelar();
                    if (aceita && item.getStatus() == StatusItem.EM_NEGOCIACAO) {
                        item.setStatus(StatusItem.ABERTO);
                    }
                });
        conversa.encerrarPorSistema(MotivoEncerramentoConversa.SEM_DEVOLUCAO);
        if (cancelarMediacoes) {
            cancelarMediacoesAbertas(conversa);
        }
    }

    /** Finaliza todos os canais de um item que chegou a um estado terminal. */
    public void itemFinalizado(Item item, MotivoEncerramentoConversa motivo) {
        conversaRepository.findAllByItemId(item.getId()).forEach(c -> encerrarConversa(c, motivo));
        mediacaoRepository.findAllByItemIdAndStatusIn(item.getId(), MEDIACOES_ABERTAS)
                .forEach(Mediacao::cancelar);
    }

    private void encerrarConversa(Conversa conversa, MotivoEncerramentoConversa motivo) {
        conversa.encerrarPorSistema(motivo);
        cancelarMediacoesAbertas(conversa);
    }

    private void cancelarMediacoesAbertas(Conversa conversa) {
        mediacaoRepository.findAllByConversaIdAndStatusIn(conversa.getId(), MEDIACOES_ABERTAS)
                .forEach(Mediacao::cancelar);
    }
}
