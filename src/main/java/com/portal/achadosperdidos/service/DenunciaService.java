package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.DenunciaDto;
import com.portal.achadosperdidos.entity.Denuncia;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Mensagem;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.exception.AcessoNegadoException;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.DenunciaRepository;
import com.portal.achadosperdidos.repository.ItemRepository;
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
public class DenunciaService {

    private final DenunciaRepository denunciaRepository;
    private final ItemRepository itemRepository;
    private final MensagemRepository mensagemRepository;
    private final AcessoService acesso;

    @Transactional
    public DenunciaDto.Response denunciarItem(Long usuarioId, Long itemId, DenunciaDto.Criar req) {
        Usuario denunciante = acesso.usuarioAtivo(usuarioId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
        if (item.getUsuario().getId().equals(usuarioId)) {
            throw new RegraNegocioException("Você não pode denunciar o seu próprio item");
        }
        Denuncia d = new Denuncia();
        d.setDenunciante(denunciante);
        d.setItem(item);
        d.setMotivo(TextoUtil.exigirTexto(req.motivo(), "motivo"));
        return DenunciaDto.Response.de(denunciaRepository.save(d));
    }

    /** Só participantes da conversa podem denunciar uma mensagem dela (e não a própria). */
    @Transactional
    public DenunciaDto.Response denunciarMensagem(Long usuarioId, Long mensagemId, DenunciaDto.Criar req) {
        Usuario denunciante = acesso.usuarioAtivo(usuarioId);
        Mensagem m = mensagemRepository.findById(mensagemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Mensagem", mensagemId));
        if (!m.getConversa().participa(denunciante)) {
            throw new AcessoNegadoException("Você não participa desta conversa");
        }
        if (m.getRemetente().getId().equals(usuarioId)) {
            throw new RegraNegocioException("Você não pode denunciar a sua própria mensagem");
        }
        Denuncia d = new Denuncia();
        d.setDenunciante(denunciante);
        d.setMensagem(m);
        d.setMotivo(TextoUtil.exigirTexto(req.motivo(), "motivo"));
        return DenunciaDto.Response.de(denunciaRepository.save(d));
    }

    public Page<DenunciaDto.Response> listar(Long adminId, boolean resolvidas, Pageable pageable) {
        acesso.exigirAdmin(adminId);
        Pageable p = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 50),
                Sort.by(Sort.Direction.ASC, "dataCriacao"));
        return denunciaRepository.findByResolvida(resolvidas, p).map(DenunciaDto.Response::de);
    }

    @Transactional
    public DenunciaDto.Response resolver(Long adminId, Long denunciaId) {
        acesso.exigirAdmin(adminId);
        Denuncia d = denunciaRepository.findById(denunciaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Denúncia", denunciaId));
        d.setResolvida(true);
        return DenunciaDto.Response.de(d);
    }
}
