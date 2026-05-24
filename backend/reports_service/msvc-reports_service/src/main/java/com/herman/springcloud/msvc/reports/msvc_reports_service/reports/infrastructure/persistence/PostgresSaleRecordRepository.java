package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.persistence;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.application.ports.SaleRecordRepository;
import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.model.SaleRecord;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PostgresSaleRecordRepository implements SaleRecordRepository {
    private final SpringDataSaleRecordRepository repository;

    public PostgresSaleRecordRepository(SpringDataSaleRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    public SaleRecord save(SaleRecord saleRecord) {
        return ReportMapper.toDomain(repository.save(ReportMapper.toJpa(saleRecord)));
    }

    @Override
    public Optional<SaleRecord> findByOrderId(UUID orderId) {
        return repository.findByOrderId(orderId).map(ReportMapper::toDomain);
    }

    @Override
    public List<SaleRecord> findByRestaurantIdAndSoldAtBetween(UUID restaurantId, Instant from, Instant to) {
        return repository.findByRestaurantIdAndSoldAtBetween(restaurantId, from, to).stream().map(ReportMapper::toDomain).toList();
    }

    @Override
    public List<SaleRecord> findBySoldAtBetween(Instant from, Instant to) {
        return repository.findBySoldAtBetween(from, to).stream().map(ReportMapper::toDomain).toList();
    }
}
