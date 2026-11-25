package com.portal.achadosperdidos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/entrar", "/cadastro", "/meus-itens", "/reivindicacoes", "/mensagens",
            "/perfil", "/mediacoes", "/admin", "/admin/{secao}", "/itens/novo", "/itens/{id}",
            "/itens/{id}/editar", "/itens/{id}/devolucao"
    })
    public String frontend() {
        return "forward:/index.html";
    }
}
