package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.persistence;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.AuditLog;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleItem;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleRecord;

import java.util.ArrayList;
import java.util.List;

public class ReportMapper {
    private ReportMapper() {
    }

    public static JpaSaleRecordEntity toJpa(SaleRecord saleRecord) {
        JpaSaleRecordEntity entity = new JpaSaleRecordEntity();
        entity.setId(saleRecord.getId());
        entity.setRestaurantId(saleRecord.getRestaurantId());
        entity.setOrderId(saleRecord.getOrderId());
        entity.setPaymentId(saleRecord.getPaymentId());
        entity.setTotalAmount(saleRecord.getTotalAmount());
        entity.setSoldAt(saleRecord.getSoldAt());
        List<JpaSaleItemEntity> items = new ArrayList<>();
        for (SaleItem item : saleRecord.getItems()) {
            JpaSaleItemEntity itemEntity = new JpaSaleItemEntity();
            itemEntity.setId(item.getId());
            itemEntity.setSaleRecord(entity);
            itemEntity.setProductId(item.getProductId());
            itemEntity.setProductName(item.getProductName());
            itemEntity.setQuantity(item.getQuantity());
            itemEntity.setUnitPrice(item.getUnitPrice());
            items.add(itemEntity);
        }
        entity.setItems(items);
        return entity;
    }

    public static SaleRecord toDomain(JpaSaleRecordEntity entity) {
        List<SaleItem> items = entity.getItems().stream()
                .map(item -> SaleItem.restore(item.getId(), item.getProductId(), item.getProductName(), item.getQuantity(), item.getUnitPrice()))
                .toList();
        return SaleRecord.restore(entity.getId(), entity.getRestaurantId(), entity.getOrderId(), entity.getPaymentId(),
                entity.getTotalAmount(), entity.getSoldAt(), items);
    }

    public static JpaAuditLogEntity toJpa(AuditLog auditLog) {
        JpaAuditLogEntity entity = new JpaAuditLogEntity();
        entity.setId(auditLog.getId());
        entity.setRestaurantId(auditLog.getRestaurantId());
        entity.setSource(auditLog.getSource());
        entity.setAction(auditLog.getAction());
        entity.setDetail(auditLog.getDetail());
        entity.setOccurredAt(auditLog.getOccurredAt());
        return entity;
    }

    public static AuditLog toDomain(JpaAuditLogEntity entity) {
        return AuditLog.restore(entity.getId(), entity.getRestaurantId(), entity.getSource(), entity.getAction(),
                entity.getDetail(), entity.getOccurredAt());
    }
}
