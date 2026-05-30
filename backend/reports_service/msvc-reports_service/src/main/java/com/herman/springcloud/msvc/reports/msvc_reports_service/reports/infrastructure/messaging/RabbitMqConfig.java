package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.infrastructure.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    @Bean
    public TopicExchange domainEventsExchange(@Value("${reports.events.exchange:events}") String exchangeName) {
        return new TopicExchange(exchangeName, true, false);
    }

    @Bean
    public Queue reportsPaymentConfirmedQueue(@Value("${reports.events.payment-confirmed.queue:reports.payment-confirmed}") String queueName) {
        return new Queue(queueName, true);
    }

    @Bean
    public Queue auditEventsQueue(@Value("${reports.events.audit.queue:reports.audit-events}") String queueName) {
        return new Queue(queueName, true);
    }

    @Bean
    public Binding reportsPaymentConfirmedBinding(Queue reportsPaymentConfirmedQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(reportsPaymentConfirmedQueue).to(domainEventsExchange).with("PaymentConfirmed");
    }

    @Bean
    public Binding auditCategoryCreatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("category.created");
    }

    @Bean
    public Binding auditCategoryUpdatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("category.updated");
    }

    @Bean
    public Binding auditCategoryDeletedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("category.deleted");
    }

    @Bean
    public Binding auditProductCreatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("product.created");
    }

    @Bean
    public Binding auditProductUpdatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("product.updated");
    }

    @Bean
    public Binding auditProductDeletedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("product.deleted");
    }

    @Bean
    public Binding auditOptionCreatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("option.created");
    }

    @Bean
    public Binding auditOptionUpdatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("option.updated");
    }

    @Bean
    public Binding auditOptionDeletedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("option.deleted");
    }

    @Bean
    public Binding auditUserCreatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("UserCreated");
    }

    @Bean
    public Binding auditUserUpdatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("UserUpdated");
    }

    @Bean
    public Binding auditUserDeletedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("UserDeleted");
    }

    @Bean
    public Binding auditRestaurantCreatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("restaurant.created");
    }

    @Bean
    public Binding auditRestaurantUpdatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("restaurant.updated");
    }

    @Bean
    public Binding auditRestaurantDeletedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("restaurant.deleted");
    }

    @Bean
    public Binding auditLoginSuccessBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("auth.login.success");
    }

    @Bean
    public Binding auditLoginFailedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("auth.login.failed");
    }

    @Bean
    public Binding auditOrderCreatedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("OrderCreated");
    }

    @Bean
    public Binding auditOrderStatusChangedBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("OrderStatusChanged");
    }

    @Bean
    public Binding auditOrderPaidBinding(Queue auditEventsQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(auditEventsQueue).to(domainEventsExchange).with("OrderPaid");
    }
}
