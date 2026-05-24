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
    public Binding reportsPaymentConfirmedBinding(Queue reportsPaymentConfirmedQueue, TopicExchange domainEventsExchange) {
        return BindingBuilder.bind(reportsPaymentConfirmedQueue).to(domainEventsExchange).with("PaymentConfirmed");
    }
}
