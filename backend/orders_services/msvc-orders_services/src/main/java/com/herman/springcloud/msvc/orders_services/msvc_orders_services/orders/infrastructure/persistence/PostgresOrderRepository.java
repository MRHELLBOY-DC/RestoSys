package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.persistence;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.ports.OrderRepository;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.Order;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@Transactional(readOnly = true)
public class PostgresOrderRepository implements OrderRepository {
    private final SpringDataOrderRepository springDataOrderRepository;
    private final OrderMapper mapper = new OrderMapper();

    public PostgresOrderRepository(SpringDataOrderRepository springDataOrderRepository) {
        this.springDataOrderRepository = springDataOrderRepository;
    }

    @Override
    @Transactional
    public Order save(Order order) {
        JpaOrderEntity entity = mapper.toEntity(order);
        return mapper.toDomain(springDataOrderRepository.save(entity));
    }

    @Override
    public Optional<Order> findById(UUID id) {
        return springDataOrderRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Order> findByOrderCode(String orderCode) {
        return springDataOrderRepository.findByOrderCode(orderCode).map(mapper::toDomain);
    }

    @Override
    public List<Order> findByRestaurantIdAndStatusIn(UUID restaurantId, List<OrderStatus> statuses) {
        return springDataOrderRepository.findByRestaurantIdAndStatusInOrderByCreatedAtDesc(restaurantId, statuses)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Order> findByRestaurantId(UUID restaurantId) {
        return springDataOrderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Order> findByClientId(UUID clientId) {
        return springDataOrderRepository.findByClientIdOrderByCreatedAtDesc(clientId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
