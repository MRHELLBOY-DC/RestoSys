package com.herman.springcloud.msvc.reports.msvc_reports_service.reports.interfaces.api;

import com.herman.springcloud.msvc.reports.msvc_reports_service.reports.domain.exceptions.DomainException;
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
}
