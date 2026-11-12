package com.portal.achadosperdidos.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ItemExpiracaoScheduler {

    private final ItemService itemService;

    /** Todo dia às 03:00. */
    @Scheduled(cron = "0 0 3 * * *")
    public void expirarItensVencidos() {
        int total = itemService.expirarVencidos();
        if (total > 0) {
            log.info("{} item(ns) marcados como EXPIRADO", total);
        }
    }
}
