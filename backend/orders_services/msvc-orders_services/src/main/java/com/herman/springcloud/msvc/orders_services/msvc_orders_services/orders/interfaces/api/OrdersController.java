package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api;

import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.change_status.ChangeOrderStatusCommand;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.change_status.ChangeOrderStatusCommandHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.create.CreateOrderCommand;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.commands.create.CreateOrderCommandHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries.GetOrderQueryHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries.ListActiveOrdersQueryHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries.ListClientOrdersQueryHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.application.queries.ListOrderHistoryQueryHandler;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.security.JwtAuthenticationFilter.AuthenticatedUserPrincipal;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto.ChangeOrderStatusRequest;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto.CreateOrderRequest;
import com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.interfaces.api.dto.OrderResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/orders")
public class OrdersController {
    private final CreateOrderCommandHandler createOrderHandler;
    private final ChangeOrderStatusCommandHandler changeOrderStatusHandler;
    private final GetOrderQueryHandler getOrderQueryHandler;
    private final ListActiveOrdersQueryHandler listActiveOrdersQueryHandler;
    private final ListOrderHistoryQueryHandler listOrderHistoryQueryHandler;
    private final ListClientOrdersQueryHandler listClientOrdersQueryHandler;

    public OrdersController(CreateOrderCommandHandler createOrderHandler,
                            ChangeOrderStatusCommandHandler changeOrderStatusHandler,
                            GetOrderQueryHandler getOrderQueryHandler,
                            ListActiveOrdersQueryHandler listActiveOrdersQueryHandler,
                            ListOrderHistoryQueryHandler listOrderHistoryQueryHandler,
                            ListClientOrdersQueryHandler listClientOrdersQueryHandler) {
        this.createOrderHandler = createOrderHandler;
        this.changeOrderStatusHandler = changeOrderStatusHandler;
        this.getOrderQueryHandler = getOrderQueryHandler;
        this.listActiveOrdersQueryHandler = listActiveOrdersQueryHandler;
        this.listOrderHistoryQueryHandler = listOrderHistoryQueryHandler;
        this.listClientOrdersQueryHandler = listClientOrdersQueryHandler;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@RequestBody CreateOrderRequest request, Authentication authentication) {
        authorizeRestaurantAccess(request.restaurantId(), authentication);
        return OrderResponse.fromDomain(createOrderHandler.handle(toCommand(request, authenticatedClientId(request.clientId(), authentication))));
    }

    @GetMapping("/{orderId}")
    public OrderResponse getById(@PathVariable UUID orderId, Authentication authentication) {
        return authorizeOrderResponse(OrderResponse.fromDomain(getOrderQueryHandler.handle(orderId)), authentication);
    }

    @GetMapping("/code/{orderCode}")
    public OrderResponse getByCode(@PathVariable String orderCode, Authentication authentication) {
        return authorizeOrderResponse(OrderResponse.fromDomain(getOrderQueryHandler.handleByCode(orderCode)), authentication);
    }

    @GetMapping("/active")
    public List<OrderResponse> listActive(@RequestParam UUID restaurantId, Authentication authentication) {
        authorizeRestaurantAccess(restaurantId, authentication);
        return listActiveOrdersQueryHandler.handle(restaurantId)
                .stream()
                .map(OrderResponse::fromDomain)
                .toList();
    }

    @GetMapping("/history")
    public List<OrderResponse> listHistory(@RequestParam UUID restaurantId, Authentication authentication) {
        authorizeRestaurantAccess(restaurantId, authentication);
        return listOrderHistoryQueryHandler.handle(restaurantId)
                .stream()
                .map(OrderResponse::fromDomain)
                .toList();
    }

    @GetMapping("/client/{clientId}")
    public List<OrderResponse> listByClient(@PathVariable UUID clientId, Authentication authentication) {
        authorizeClientAccess(clientId, authentication);
        return listClientOrdersQueryHandler.handle(clientId)
                .stream()
                .map(OrderResponse::fromDomain)
                .toList();
    }

    @PatchMapping("/{orderId}/status")
    public OrderResponse changeStatus(@PathVariable UUID orderId, @RequestBody ChangeOrderStatusRequest request, Authentication authentication) {
        authorizeRestaurantAccess(OrderResponse.fromDomain(getOrderQueryHandler.handle(orderId)).restaurantId(), authentication);
        return OrderResponse.fromDomain(changeOrderStatusHandler.handle(new ChangeOrderStatusCommand(orderId, request.status())));
    }

    private CreateOrderCommand toCommand(CreateOrderRequest request, UUID clientId) {
        List<CreateOrderCommand.CreateOrderItemCommand> items = (request.items() == null ? List.<CreateOrderRequest.CreateOrderItemRequest>of() : request.items()).stream()
                .map(item -> new CreateOrderCommand.CreateOrderItemCommand(
                        item.productId(),
                        item.productName(),
                        item.quantity(),
                        item.unitPrice(),
                        item.options() == null ? List.of() : item.options().stream()
                                .map(option -> new CreateOrderCommand.CreateOrderItemOptionCommand(
                                        option.optionId(),
                                        option.name(),
                                        option.extraPrice()
                                ))
                                .toList()
                ))
                .toList();
        return new CreateOrderCommand(request.restaurantId(), clientId, request.type(), request.tableNumber(), items);
    }

    private UUID authenticatedClientId(UUID requestedClientId, Authentication authentication) {
        AuthenticatedUserPrincipal user = authenticatedUser(authentication);
        if (isRole(authentication, "cliente")) {
            return numericIdToUuid(user.id());
        }
        if (requestedClientId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clientId es requerido");
        }
        return requestedClientId;
    }

    private OrderResponse authorizeOrderResponse(OrderResponse response, Authentication authentication) {
        if (isRole(authentication, "admin")) {
            return response;
        }
        if (isRole(authentication, "cliente")) {
            authorizeClientAccess(response.clientId(), authentication);
            return response;
        }
        authorizeRestaurantAccess(response.restaurantId(), authentication);
        return response;
    }

    private void authorizeClientAccess(UUID clientId, Authentication authentication) {
        if (!isRole(authentication, "cliente")) {
            return;
        }
        UUID authenticatedClientId = numericIdToUuid(authenticatedUser(authentication).id());
        if (!authenticatedClientId.equals(clientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a pedidos de otro cliente");
        }
    }

    private void authorizeRestaurantAccess(UUID restaurantId, Authentication authentication) {
        AuthenticatedUserPrincipal user = authenticatedUser(authentication);
        String role = user.role();
        Long userRestaurantId = user.restaurantId();
        
        if ("admin".equals(role)) {
            return;
        }
        
        if ("cliente".equals(role)) {
            return;
        }
        
        if ("empleado".equals(role) || "restaurante".equals(role)) {
            if (userRestaurantId == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes restaurante asignado");
            }
            if (!numericIdToUuid(userRestaurantId).equals(restaurantId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes acceder a pedidos de otro restaurante");
            }
            return;
        }
        
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para acceder a pedidos");
    }

    private AuthenticatedUserPrincipal authenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUserPrincipal user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token requerido");
        }
        return user;
    }

    private boolean isRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    private UUID numericIdToUuid(Long id) {
        return UUID.fromString("00000000-0000-0000-0000-" + String.format("%012d", id));
    }
}