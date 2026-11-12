package com.portal.achadosperdidos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Violação de regra de negócio (HTTP 422). */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
