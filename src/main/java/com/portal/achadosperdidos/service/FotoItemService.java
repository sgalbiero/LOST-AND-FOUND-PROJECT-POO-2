package com.portal.achadosperdidos.service;

import com.portal.achadosperdidos.entity.FotoItem;
import com.portal.achadosperdidos.repository.FotoItemRepository;
import org.springframework.stereotype.Service;

@Service
public class FotoItemService extends CrudService<FotoItem> {
    public FotoItemService(FotoItemRepository repository) {
        super(repository, "Foto");
    }
}
