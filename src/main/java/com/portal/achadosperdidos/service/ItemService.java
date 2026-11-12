package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.dto.ItemDto;
import com.portal.achadosperdidos.entity.Categoria;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.entity.Local;
import com.portal.achadosperdidos.entity.Usuario;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.StatusReivindicacao;
import com.portal.achadosperdidos.enums.TipoItem;
import com.portal.achadosperdidos.exception.RecursoNaoEncontradoException;
import com.portal.achadosperdidos.exception.RegraNegocioException;
import com.portal.achadosperdidos.repository.CategoriaRepository;
import com.portal.achadosperdidos.repository.ItemRepository;
import com.portal.achadosperdidos.repository.ItemSpecs;
import com.portal.achadosperdidos.repository.LocalRepository;
import com.portal.achadosperdidos.repository.ReivindicacaoRepository;
import com.portal.achadosperdidos.util.TextoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private static final int TAMANHO_MAXIMO_PAGINA = 50;

    private final ItemRepository itemRepository;
    private final CategoriaRepository categoriaRepository;
    private final LocalRepository localRepository;
    private final ReivindicacaoRepository reivindicacaoRepository;
    private final AcessoService acesso;

    @Value("${app.item.dias-expiracao:90}")
    private int diasExpiracao;

    // ------------------------------------------------------------------ escrita

    @Transactional
    public ItemDto.Detalhe criar(Long usuarioId, ItemDto.Criar req) {
        Usuario autor = acesso.usuarioAtivo(usuarioId);

        Item item = new Item();
        item.setUsuario(autor);
        item.setTipo(req.tipo());
        item.setStatus(StatusItem.ABERTO);
        item.setExpiraEm(LocalDateTime.now().plusDays(diasExpiracao));
        aplicarDados(item, req.titulo(), req.descricao(), req.dataOcorrencia(), req.localGuarda(),
                req.categoriaId(), req.localId());
        substituirFotos(item, req.fotos());

        return ItemDto.Detalhe.de(itemRepository.save(item));
    }

    @Transactional
    public ItemDto.Detalhe atualizar(Long usuarioId, Long itemId, ItemDto.Atualizar req) {
        Item item = buscarDetalhado(itemId);
        acesso.exigirDonoOuAdmin(usuarioId, item);
        if (item.getStatus() != StatusItem.ABERTO) {
            throw new RegraNegocioException("Apenas itens abertos podem ser editados");
        }
        aplicarDados(item, req.titulo(), req.descricao(), req.dataOcorrencia(), req.localGuarda(),
                req.categoriaId(), req.localId());
        substituirFotos(item, req.fotos());
        return ItemDto.Detalhe.de(item);
    }

    /** Cancela a publicação. Se havia uma reivindicação aceita, ela também é cancelada. */
    @Transactional
    public ItemDto.Detalhe cancelar(Long usuarioId, Long itemId) {
        Item item = itemRepository.findByIdParaAtualizar(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
        acesso.exigirDonoOuAdmin(usuarioId, item);
        if (item.getStatus() != StatusItem.ABERTO && item.getStatus() != StatusItem.EM_NEGOCIACAO) {
            throw new RegraNegocioException("Este item não pode mais ser cancelado (status: " + item.getStatus() + ")");
        }
        reivindicacaoRepository.findByItemIdAndStatus(itemId, StatusReivindicacao.ACEITA)
                .ifPresent(r -> r.cancelar());
        item.setStatus(StatusItem.CANCELADO);
        return ItemDto.Detalhe.de(buscarDetalhado(itemId));
    }

    /** Chamado pelo agendador: marca como EXPIRADO os itens abertos com prazo vencido. */
    @Transactional
    public int expirarVencidos() {
        return itemRepository.expirarVencidos(StatusItem.ABERTO, StatusItem.EXPIRADO, LocalDateTime.now());
    }

    // ------------------------------------------------------------------ leitura

    public ItemDto.Detalhe buscar(Long itemId) {
        return ItemDto.Detalhe.de(buscarDetalhado(itemId));
    }

    /** Feed público. Sem filtro de status, mostra apenas itens ABERTOS. */
    public Page<ItemDto.Resumo> pesquisar(ItemDto.Filtro filtro, Pageable pageable) {
        StatusItem status = filtro.status() != null ? filtro.status() : StatusItem.ABERTO;

        Specification<Item> spec = Specification.allOf(
                ItemSpecs.comStatus(status),
                ItemSpecs.comTipo(filtro.tipo()),
                ItemSpecs.comCategoria(filtro.categoriaId()),
                ItemSpecs.comLocal(filtro.localId()),
                ItemSpecs.comTermo(filtro.termo()));

        return itemRepository.findAll(spec, paginacaoSegura(pageable)).map(ItemDto.Resumo::de);
    }

    public Page<ItemDto.Resumo> listarMeus(Long usuarioId, Pageable pageable) {
        acesso.usuarioAtivo(usuarioId);
        return itemRepository.findByUsuarioId(usuarioId, paginacaoSegura(pageable)).map(ItemDto.Resumo::de);
    }

    // ------------------------------------------------------------------ internos

    private void aplicarDados(Item item, String titulo, String descricao, LocalDate dataOcorrencia,
                              String localGuarda, Long categoriaId, Long localId) {
        item.setTitulo(TextoUtil.exigir(titulo, "titulo"));
        item.setDescricao(TextoUtil.exigir(descricao, "descricao"));
        item.setDataOcorrencia(dataOcorrencia != null ? dataOcorrencia : LocalDate.now());
        // "Onde o item está agora" só faz sentido para itens ENCONTRADOS
        item.setLocalGuarda(item.getTipo() == TipoItem.ENCONTRADO ? TextoUtil.sanitizarOuNulo(localGuarda) : null);

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .filter(Categoria::isAtivo)
                .orElseThrow(() -> new RegraNegocioException("Categoria inexistente ou inativa"));
        Local local = localRepository.findById(localId)
                .filter(Local::isAtivo)
                .orElseThrow(() -> new RegraNegocioException("Local inexistente ou inativo"));
        item.setCategoria(categoria);
        item.setLocal(local);
    }

    private void substituirFotos(Item item, List<String> urls) {
        if (urls == null || urls.isEmpty() || urls.size() > 3) {
            throw new RegraNegocioException("O item deve ter de 1 a 3 fotos");
        }
        List<String> limpas = urls.stream().map(String::trim).toList();
        if (limpas.stream().anyMatch(u -> !u.startsWith("https://"))) {
            throw new RegraNegocioException("As URLs das fotos devem usar https");
        }
        item.getFotos().clear();
        limpas.forEach(item::adicionarFoto);
    }

    private Item buscarDetalhado(Long itemId) {
        return itemRepository.findDetalhadoById(itemId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item", itemId));
    }

    private Pageable paginacaoSegura(Pageable pageable) {
        int tamanho = Math.min(pageable.getPageSize(), TAMANHO_MAXIMO_PAGINA);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "dataPublicacao");
        return PageRequest.of(pageable.getPageNumber(), tamanho, sort);
    }
}
