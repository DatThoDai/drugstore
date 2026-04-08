package com.datn.drugstore.controller;

import com.datn.drugstore.dto.OrderDTO;
import com.datn.drugstore.entity.User;
import com.datn.drugstore.request.CreateOrderRequest;
import com.datn.drugstore.response.BaseResponse;
import com.datn.drugstore.service.OrderService;
import com.datn.drugstore.utils.ResponseFactory;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @PostMapping
    public ResponseEntity<BaseResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal User user) {
        OrderDTO order = orderService.createOrder(request, user.getId());
        return ResponseFactory.created(order);
    }

    @GetMapping("/all")
    public ResponseEntity<BaseResponse> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseFactory.success(orders);
    }

    @GetMapping
    public ResponseEntity<BaseResponse> getUserOrders(@AuthenticationPrincipal User user) {
        List<OrderDTO> orders = orderService.getUserOrders(user.getId());
        return ResponseFactory.success(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        OrderDTO order = orderService.getOrderById(id, user.getId());
        return ResponseFactory.success(order);
    }

    @PostMapping("/{id}/vnpay-url")
    public ResponseEntity<BaseResponse> createVNPayPaymentUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest request) {
        try {
            if (currentUser == null) {
                return ResponseFactory.error(401, "Chưa đăng nhập", HttpStatus.UNAUTHORIZED);
            }

            String ipAddr = request.getHeader("X-Forwarded-For");
            if (ipAddr == null || ipAddr.isBlank()) {
                ipAddr = request.getRemoteAddr();
            }
            if (ipAddr != null && ipAddr.contains(",")) {
                ipAddr = ipAddr.split(",")[0].trim();
            }

            String paymentUrl = orderService.createVNPayPaymentUrl(id, currentUser.getId(), ipAddr);
            return ResponseFactory.success(Map.of("paymentUrl", paymentUrl));
        } catch (Exception e) {
            return ResponseFactory.error(400, e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> handleVNPayReturn(@RequestParam Map<String, String> queryParams) {
        String redirectUrl = appUrl + "/?vnpay=failed";
        try {
            OrderDTO order = orderService.handleVNPayReturn(queryParams);
            redirectUrl = appUrl + "/order/" + order.getId() + "?vnpay=success";
        } catch (Exception e) {
            String txnRef = queryParams.get("vnp_TxnRef");
            if (txnRef != null && !txnRef.isBlank()) {
                String orderId = txnRef.contains("-") ? txnRef.substring(0, txnRef.indexOf("-")) : txnRef;
                redirectUrl = appUrl + "/order/" + orderId + "?vnpay=failed";
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<BaseResponse> markOrderAsPaid(
            @PathVariable Long id,
            @RequestBody Map<String, Object> paymentData,
            @AuthenticationPrincipal User currentUser) {
        try {
            if (currentUser == null) {
                return ResponseFactory.error(401, "Chưa đăng nhập", HttpStatus.UNAUTHORIZED);
            }

            try {
                OrderDTO order = orderService.getOrderById(id, currentUser.getId());
                boolean isOwner = order.getUser().getId().equals(currentUser.getId());
                boolean isAdmin = currentUser.getIsAdmin() != null && currentUser.getIsAdmin();
                
                if (!isOwner && !isAdmin) {
                    return ResponseFactory.error(403, "Bạn không có quyền thanh toán đơn hàng này", HttpStatus.FORBIDDEN);
                }
            } catch (RuntimeException e) {
                boolean isAdmin = currentUser.getIsAdmin() != null && currentUser.getIsAdmin();
                if (!isAdmin) {
                    return ResponseFactory.error(404, "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập", HttpStatus.NOT_FOUND);
                }
            }
            
            OrderDTO updatedOrder = orderService.markOrderAsPaid(id, paymentData);
            return ResponseFactory.success(updatedOrder, "Đơn hàng đã được thanh toán");
        } catch (Exception e) {
            return ResponseFactory.error(500, "Lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}/delivered")
    public ResponseEntity<BaseResponse> markOrderAsDelivered(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal User currentUser) {
        try {
            if (currentUser == null) {
                return ResponseFactory.error(401, "Chưa đăng nhập", HttpStatus.UNAUTHORIZED);
            }

            try {
                OrderDTO order = orderService.getOrderById(id, currentUser.getId());
                boolean isOwner = order.getUser().getId().equals(currentUser.getId());
                boolean isAdmin = currentUser.getIsAdmin() != null && currentUser.getIsAdmin();
                
                if (!isOwner && !isAdmin) {
                    return ResponseFactory.error(403, "Bạn không có quyền xác nhận nhận hàng cho đơn hàng này", HttpStatus.FORBIDDEN);
                }
            } catch (RuntimeException e) {
                boolean isAdmin = currentUser.getIsAdmin() != null && currentUser.getIsAdmin();
                if (!isAdmin) {
                    return ResponseFactory.error(404, "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập", HttpStatus.NOT_FOUND);
                }
            }
            
            String status = request.get("status");
            OrderDTO updatedOrder = orderService.markOrderAsDelivered(id, status);
            return ResponseFactory.success(updatedOrder, "Cập nhật trạng thái thành công");
        } catch (Exception e) {
            return ResponseFactory.error(500, "Lỗi khi cập nhật trạng thái: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/search/{search}")
    public ResponseEntity<BaseResponse> searchOrders(@PathVariable String search) {
        List<OrderDTO> orders = orderService.searchOrdersByUserEmail(search);
        return ResponseFactory.success(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<BaseResponse> getOrdersByStatus(@PathVariable String status) {
        List<OrderDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseFactory.success(orders);
    }

    @GetMapping("/option/{option}")
    public ResponseEntity<BaseResponse> getOrdersByTypePay(@PathVariable String option) {
        List<OrderDTO> orders = orderService.getOrdersByTypePay(option);
        return ResponseFactory.success(orders);
    }

    @GetMapping("/combine/{status}/{option}")
    public ResponseEntity<BaseResponse> getOrdersByStatusAndTypePay(
            @PathVariable String status,
            @PathVariable String option) {
        List<OrderDTO> orders = orderService.getOrdersByStatusAndTypePay(status, option);
        return ResponseFactory.success(orders);
    }

    @GetMapping("/filter/{startDate}/{endDate}")
    public ResponseEntity<BaseResponse> getOrderStatistics(
            @PathVariable String startDate,
            @PathVariable String endDate) {
        List<Map<String, Object>> stats = orderService.getOrderStatistics(startDate, endDate);
        return ResponseFactory.success(stats);
    }

    @PostMapping("/order-repair")
    public ResponseEntity<BaseResponse> createOrderRepair(@RequestBody Map<String, Long> request) {
        Long orderId = request.get("id");
        OrderDTO order = orderService.createOrderRepair(orderId);
        return ResponseFactory.created(order);
    }
}
