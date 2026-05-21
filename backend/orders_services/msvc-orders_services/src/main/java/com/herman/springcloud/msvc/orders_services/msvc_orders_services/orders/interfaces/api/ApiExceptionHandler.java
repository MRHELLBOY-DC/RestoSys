package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.DomainException;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.domain.exceptions.OrderNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomainException(DomainException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Regla de negocio invalida");
        problemDetail.setDetail(exception.getMessage());
        return problemDetail;
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ProblemDetail handleOrderNotFoundException(OrderNotFoundException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problemDetail.setTitle("Pedido no encontrado");
        problemDetail.setDetail(exception.getMessage());
        return problemDetail;
    }
}
