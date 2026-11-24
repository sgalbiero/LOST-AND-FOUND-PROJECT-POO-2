package com.portal.achadosperdidos.controller;

import java.time.OffsetDateTime;
import java.util.Map;

public record ApiError(OffsetDateTime instante, int status, String erro,
                       String mensagem, Map<String, String> campos) {
    public static ApiError de(int status, String erro, String mensagem) {
        return new ApiError(OffsetDateTime.now(), status, erro, mensagem, Map.of());
    }
}
