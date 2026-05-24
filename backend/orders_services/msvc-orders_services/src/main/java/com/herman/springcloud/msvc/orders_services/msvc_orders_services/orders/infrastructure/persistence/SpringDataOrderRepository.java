package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.persistence;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataOrderRepository extends JpaRepository<JpaOrderEntity, UUID> {
    Optional<JpaOrderEntity> findByOrderCode(String orderCode);

    List<JpaOrderEntity> findByRestaurantIdAndStatusInOrderByCreatedAtDesc(UUID restaurantId, List<OrderStatus> statuses);

    List<JpaOrderEntity> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    List<JpaOrderEntity> findByClientIdOrderByCreatedAtDesc(UUID clientId);
}
