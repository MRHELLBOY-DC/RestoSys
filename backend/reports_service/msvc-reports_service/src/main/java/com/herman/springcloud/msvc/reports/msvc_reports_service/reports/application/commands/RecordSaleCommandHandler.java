package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.commands;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.DomainEventPublisher;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.SaleRecordRepository;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.events.DomainEvent;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleItem;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecordSaleCommandHandler {
    private final SaleRecordRepository saleRecordRepository;
    private final DomainEventPublisher eventPublisher;

    public RecordSaleCommandHandler(SaleRecordRepository saleRecordRepository, DomainEventPublisher eventPublisher) {
        this.saleRecordRepository = saleRecordRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public SaleRecord handle(RecordSaleCommand command) {
        return saleRecordRepository.findByOrderId(command.orderId())
                .orElseGet(() -> createSaleRecord(command));
    }

    private SaleRecord createSaleRecord(RecordSaleCommand command) {
        List<SaleItem> items = command.items() == null ? List.of() : command.items().stream()
                .map(item -> SaleItem.create(item.productId(), item.productName(), item.quantity(), item.unitPrice()))
                .toList();
        SaleRecord saleRecord = SaleRecord.create(command.restaurantId(), command.orderId(), command.paymentId(), command.clientId(), command.totalAmount(), command.soldAt(), items);
        List<DomainEvent> events = saleRecord.pullDomainEvents();
        SaleRecord savedSaleRecord = saleRecordRepository.save(saleRecord);
        events.forEach(eventPublisher::publish);
        return savedSaleRecord;
    }
}
