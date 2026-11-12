package com.portal.achadosperdidos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Conflito com o estado atual dos dados, ex.: duplicidade (HTTP 409). */
@ResponseStatus(HttpStatus.CONFLICT)
public class ConflitoException extends RuntimeException {
    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
