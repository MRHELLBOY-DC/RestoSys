package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.messaging;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    @Bean
    public TopicExchange domainEventsExchange(@Value("${orders.events.exchange:events}") String exchangeName) {
        return new TopicExchange(exchangeName, true, false);
    }
}
