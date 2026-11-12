package com.portal.achadosperdidos.dto;

import com.portal.achadosperdidos.entity.FotoItem;
import com.portal.achadosperdidos.entity.Item;
import com.portal.achadosperdidos.enums.StatusItem;
import com.portal.achadosperdidos.enums.TipoItem;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ItemDto {

    private ItemDto() {
    }

    public record Criar(
            @NotBlank @Size(max = 255) String titulo,
            @NotBlank @Size(max = 300) String descricao,
            @NotNull TipoItem tipo,
            @PastOrPresent LocalDate dataOcorrencia,
            @Size(max = 255) String localGuarda,
            @NotNull Long categoriaId,
            @NotNull Long localId,
            @NotEmpty @Size(max = 3) List<@NotBlank @Size(max = 500) String> fotos) {
    }

    /** O tipo (PERDIDO/ENCONTRADO) não pode ser alterado depois de publicado. */
    public record Atualizar(
            @NotBlank @Size(max = 255) String titulo,
            @NotBlank @Size(max = 300) String descricao,
            @PastOrPresent LocalDate dataOcorrencia,
            @Size(max = 255) String localGuarda,
            @NotNull Long categoriaId,
            @NotNull Long localId,
            @NotEmpty @Size(max = 3) List<@NotBlank @Size(max = 500) String> fotos) {
    }

    public record Filtro(String termo, TipoItem tipo, StatusItem status, Long categoriaId, Long localId) {
    }

    /** Card da listagem. */
    public record Resumo(Long id, String titulo, TipoItem tipo, StatusItem status,
                         LocalDate dataOcorrencia, LocalDateTime dataPublicacao,
                         String categoria, String local, String fotoPrincipal) {
        public static Resumo de(Item i) {
            String foto = i.getFotos().isEmpty() ? null : i.getFotos().get(0).getUrl();
            return new Resumo(i.getId(), i.getTitulo(), i.getTipo(), i.getStatus(),
                    i.getDataOcorrencia(), i.getDataPublicacao(),
                    i.getCategoria().getNome(), i.getLocal().getNome(), foto);
        }
    }

    public record Detalhe(Long id, String titulo, String descricao, TipoItem tipo, StatusItem status,
                          LocalDate dataOcorrencia, LocalDateTime dataPublicacao, LocalDateTime expiraEm,
                          String localGuarda, UsuarioDto.Resumo usuario,
                          Long categoriaId, String categoria, Long localId, String local,
                          List<String> fotos) {
        public static Detalhe de(Item i) {
            return new Detalhe(i.getId(), i.getTitulo(), i.getDescricao(), i.getTipo(), i.getStatus(),
                    i.getDataOcorrencia(), i.getDataPublicacao(), i.getExpiraEm(),
                    i.getLocalGuarda(), UsuarioDto.Resumo.de(i.getUsuario()),
                    i.getCategoria().getId(), i.getCategoria().getNome(),
                    i.getLocal().getId(), i.getLocal().getNome(),
                    i.getFotos().stream().map(FotoItem::getUrl).toList());
        }
    }
}
