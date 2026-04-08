package com.datn.drugstore.service.impl;
import com.datn.drugstore.config.VNPayConfig;
import com.datn.drugstore.dto.*;
import com.datn.drugstore.entity.*;
import com.datn.drugstore.repository.OrderRepository;
import com.datn.drugstore.repository.ProductRepository;
import com.datn.drugstore.repository.UserRepository;
import com.datn.drugstore.request.CreateOrderRequest;
import com.datn.drugstore.service.OrderService;
import com.datn.drugstore.utils.VNPayUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final VNPayConfig vnPayConfig;

    private static final DateTimeFormatter VNPAY_DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setTaxPrice(request.getTaxPrice() != null ? request.getTaxPrice() : BigDecimal.ZERO);
        order.setShippingPrice(request.getShippingPrice() != null ? request.getShippingPrice() : BigDecimal.ZERO);
        order.setTotalPrice(request.getTotalPrice() != null ? request.getTotalPrice() : BigDecimal.ZERO);
        order.setTypePay(request.getTypePay());
        order.setIsReceive(false);

        ShippingAddress shippingAddress = new ShippingAddress();
        shippingAddress.setAddress(request.getShippingAddress().getAddress());
        shippingAddress.setCity(request.getShippingAddress().getCity());
        shippingAddress.setPostalCode(request.getShippingAddress().getPostalCode());
        shippingAddress.setCountry(request.getShippingAddress().getCountry());
        shippingAddress.setOrder(order);
        order.setShippingAddress(shippingAddress);

        List<OrderItem> orderItems = request.getOrderItems().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProduct())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            int qty = itemRequest.getQty() != null ? itemRequest.getQty() : 1;
            int currentStock = product.getCountInStock() != null ? product.getCountInStock() : 0;
            if (currentStock < qty) {
                throw new RuntimeException("Sản phẩm \"" + product.getName() + "\" không đủ tồn kho (còn " + currentStock + ")");
            }
            product.setCountInStock(currentStock - qty);
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setName(itemRequest.getName());
            orderItem.setQty(qty);
            orderItem.setImage(itemRequest.getImage());
            orderItem.setPrice(itemRequest.getPrice());
            orderItem.setLoanPrice(itemRequest.getLoanPrice());
            orderItem.setProduct(product);
            orderItem.setOrder(order);
            return orderItem;
        }).collect(Collectors.toList());
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO getOrderById(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = user.getIsAdmin() != null && user.getIsAdmin();

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to view this order");
        }

        return convertToDTO(order);
    }

    @Override
    public String createVNPayPaymentUrl(Long id, Long userId, String ipAddr) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = user.getIsAdmin() != null && user.getIsAdmin();
        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to pay this order");
        }

        if (Boolean.TRUE.equals(order.getIsPaid())) {
            throw new RuntimeException("Order already paid");
        }

        long amount = order.getTotalPrice()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        String txnRef = order.getId() + "-" + now.format(VNPAY_DATETIME_FORMAT);

        String clientIp = ipAddr;
        if (clientIp == null || clientIp.isBlank() || "::1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp)) {
            clientIp = vnPayConfig.getVnpIpAddr();
        }

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang #" + order.getId());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", clientIp);
        vnpParams.put("vnp_CreateDate", now.format(VNPAY_DATETIME_FORMAT));
        vnpParams.put("vnp_ExpireDate", now.plusMinutes(15).format(VNPAY_DATETIME_FORMAT));

        return VNPayUtils.buildQuery(vnpParams, vnPayConfig.getVnpHashSecret(), vnPayConfig.getVnpUrl());
    }

    @Override
    @Transactional
    public OrderDTO handleVNPayReturn(Map<String, String> queryParams) {
        String secureHash = queryParams.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            throw new RuntimeException("Thiếu chữ ký VNPay");
        }

        Map<String, String> signParams = new HashMap<>(queryParams);
        signParams.remove("vnp_SecureHash");
        signParams.remove("vnp_SecureHashType");

        boolean validSignature = VNPayUtils.isValidSignature(signParams, vnPayConfig.getVnpHashSecret(), secureHash);
        if (!validSignature) {
            throw new RuntimeException("Chữ ký VNPay không hợp lệ");
        }

        String responseCode = signParams.get("vnp_ResponseCode");
        if (!"00".equals(responseCode)) {
            throw new RuntimeException("Giao dịch VNPay không thành công");
        }

        String txnRef = signParams.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isBlank()) {
            throw new RuntimeException("Thiếu mã giao dịch");
        }

        String orderIdPart = txnRef.contains("-") ? txnRef.substring(0, txnRef.indexOf("-")) : txnRef;
        Long orderId;
        try {
            orderId = Long.parseLong(orderIdPart);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Mã đơn hàng không hợp lệ");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!Boolean.TRUE.equals(order.getIsPaid())) {
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("id", txnRef);
            paymentData.put("status", "COMPLETED");
            paymentData.put("update_time", signParams.getOrDefault("vnp_PayDate", LocalDateTime.now().toString()));
            paymentData.put("email_address", signParams.getOrDefault("vnp_BankCode", "VNPay"));
            markOrderAsPaid(orderId, paymentData);
        }

        Order updatedOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(updatedOrder);
    }

    @Override
    @Transactional
    public OrderDTO markOrderAsPaid(Long id, Map<String, Object> paymentData) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setIsPaid(true);
        order.setPaidAt(LocalDateTime.now());

        if (paymentData != null && !paymentData.isEmpty()) {
            try {
                PaymentResult paymentResult = new PaymentResult();
                String paymentId = null;
                if (paymentData.get("id") != null) {
                    paymentId = paymentData.get("id").toString();
                } else if (paymentData.get("paymentID") != null) {
                    paymentId = paymentData.get("paymentID").toString();
                } else if (paymentData.get("paymentId") != null) {
                    paymentId = paymentData.get("paymentId").toString();
                }
                paymentResult.setPaymentId(paymentId);
                
                String status = null;
                if (paymentData.get("status") != null) {
                    status = paymentData.get("status").toString();
                } else if (paymentData.get("state") != null) {
                    status = paymentData.get("state").toString();
                } else {
                    status = "COMPLETED";
                }
                paymentResult.setStatus(status);
                
                String updateTime = null;
                if (paymentData.get("update_time") != null) {
                    updateTime = paymentData.get("update_time").toString();
                } else if (paymentData.get("updateTime") != null) {
                    updateTime = paymentData.get("updateTime").toString();
                } else {
                    updateTime = LocalDateTime.now().toString();
                }
                paymentResult.setUpdateTime(updateTime);
                
                String emailAddress = null;
                if (paymentData.get("email_address") != null) {
                    emailAddress = paymentData.get("email_address").toString();
                } else if (paymentData.get("payer") != null) {
                    Object payerObj = paymentData.get("payer");
                    if (payerObj instanceof Map) {
                        Map<?, ?> payer = (Map<?, ?>) payerObj;
                        if (payer.get("email_address") != null) {
                            emailAddress = payer.get("email_address").toString();
                        }
                    }
                }
                paymentResult.setEmailAddress(emailAddress);
                
                paymentResult.setOrder(order);
                order.setPaymentResult(paymentResult);
            } catch (Exception e) {
            }
        }

        try {
            Order updatedOrder = orderRepository.save(order);
            orderRepository.flush();
            return convertToDTO(updatedOrder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save order payment status: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public OrderDTO markOrderAsDelivered(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setIsDelivered(true);
        order.setDeliveredAt(LocalDateTime.now());
        order.setStatus(status);
        if (!Boolean.TRUE.equals(order.getIsPaid())) {
            order.setIsPaid(true);
            order.setPaidAt(LocalDateTime.now());
        }

        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Override
    public List<OrderDTO> searchOrdersByUserEmail(String email) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getEmail().toLowerCase().contains(email.toLowerCase()))
                .collect(Collectors.toList());

        List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());

        return orderRepository.findAll().stream()
                .filter(order -> userIds.contains(order.getUser().getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByStatus(String status) {
        if ("choxuli".equals(status)) {
            return orderRepository.findByStatusNull().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else if ("default".equals(status)) {
            return orderRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return orderRepository.findByStatus(status).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<OrderDTO> getOrdersByTypePay(String typePay) {
        if ("default".equals(typePay)) {
            return orderRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return orderRepository.findByTypePay(typePay).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<OrderDTO> getOrdersByStatusAndTypePay(String status, String typePay) {
        if ("choxuli".equals(status)) {
            return orderRepository.findByStatusNullAndTypePay(typePay).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return orderRepository.findByStatusAndTypePay(status, typePay).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<Map<String, Object>> getOrderStatistics(String startDate, String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
        LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");

        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);

        return orders.stream()
                .collect(Collectors.groupingBy(
                        order -> Map.of(
                                "month", order.getCreatedAt().getMonthValue(),
                                "year", order.getCreatedAt().getYear()
                        ),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    Map<String, Object> map = new HashMap<>();
                                    map.put("id", list.get(0).getCreatedAt().getMonthValue() + "/" + list.get(0).getCreatedAt().getYear());
                                    map.put("count", (long) list.size());
                                    map.put("totalPrice", list.stream().mapToDouble(o -> o.getTotalPrice().doubleValue()).sum());
                                    return map;
                                }
                        )
                ))
                .values()
                .stream()
                .sorted((a, b) -> {
                    String[] aParts = ((String) a.get("id")).split("/");
                    String[] bParts = ((String) b.get("id")).split("/");
                    int yearCmp = Integer.compare(Integer.parseInt(aParts[1]), Integer.parseInt(bParts[1]));
                    return yearCmp != 0 ? yearCmp : Integer.compare(Integer.parseInt(aParts[0]), Integer.parseInt(bParts[0]));
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO createOrderRepair(Long orderId) {
        Order originalOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order repairOrder = new Order();
        repairOrder.setUser(originalOrder.getUser());
        repairOrder.setOrderItems(originalOrder.getOrderItems().stream().map(item -> {
            OrderItem newItem = new OrderItem();
            newItem.setName(item.getName());
            newItem.setQty(item.getQty());
            newItem.setImage(item.getImage());
            newItem.setPrice(item.getPrice());
            newItem.setLoanPrice(item.getLoanPrice());
            newItem.setProduct(item.getProduct());
            newItem.setOrder(repairOrder);
            return newItem;
        }).collect(Collectors.toList()));

        ShippingAddress repairAddress = new ShippingAddress();
        ShippingAddress originalAddress = originalOrder.getShippingAddress();
        if (originalAddress != null) {
            repairAddress.setAddress(originalAddress.getAddress());
            repairAddress.setCity(originalAddress.getCity());
            repairAddress.setPostalCode(originalAddress.getPostalCode());
            repairAddress.setCountry(originalAddress.getCountry());
        }
        repairAddress.setOrder(repairOrder);
        repairOrder.setShippingAddress(repairAddress);


        BigDecimal itemsPrice = originalOrder.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shippingPrice = itemsPrice.compareTo(new BigDecimal("500000")) > 0
                ? BigDecimal.ZERO : new BigDecimal("30000");
        BigDecimal taxPrice = itemsPrice.multiply(new BigDecimal("0.02"))
                .setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalPrice = itemsPrice.add(shippingPrice).add(taxPrice);

        repairOrder.setPaymentMethod(originalOrder.getPaymentMethod());
        repairOrder.setTaxPrice(taxPrice);
        repairOrder.setShippingPrice(shippingPrice);
        repairOrder.setTotalPrice(totalPrice);
        repairOrder.setTypePay("buy");
        repairOrder.setIsPaid(false);
        repairOrder.setIsDelivered(false);

        Order savedOrder = orderRepository.save(repairOrder);
        return convertToDTO(savedOrder);
    }

    private OrderDTO convertToDTO(Order order) {
        UserDTO userDTO = new UserDTO(order.getUser().getId(), order.getUser().getName(),
                order.getUser().getEmail(), order.getUser().getPhone(), order.getUser().getIsAdmin(), order.getUser().getCreatedAt(), null);

        List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                .map(item -> new OrderItemDTO(item.getId(), item.getName(), item.getQty(), item.getImage(),
                        item.getPrice(), item.getLoanPrice(),
                        new ProductDTO(item.getProduct().getId(), item.getProduct().getMa(), item.getProduct().getName(),
                                item.getProduct().getImage(), item.getProduct().getDescription(), null,
                                item.getProduct().getRating(), item.getProduct().getNumReviews(), null,
                                item.getProduct().getPrice(), item.getProduct().getCountInStock(),
                                item.getProduct().getLowStockThreshold() != null ? item.getProduct().getLowStockThreshold() : 10,
                                item.getProduct().getLoanPrice(), item.getProduct().getIsBought(),
                                item.getProduct().getCreatedAt(), item.getProduct().getUpdatedAt())))
                .collect(Collectors.toList());

        ShippingAddressDTO shippingAddressDTO = order.getShippingAddress() != null ?
                new ShippingAddressDTO(order.getShippingAddress().getId(), order.getShippingAddress().getAddress(),
                        order.getShippingAddress().getCity(), order.getShippingAddress().getPostalCode(),
                        order.getShippingAddress().getCountry()) : null;

        PaymentResultDTO paymentResultDTO = order.getPaymentResult() != null ?
                new PaymentResultDTO(order.getPaymentResult().getId(), order.getPaymentResult().getPaymentId(),
                        order.getPaymentResult().getStatus(), order.getPaymentResult().getUpdateTime(),
                        order.getPaymentResult().getEmailAddress()) : null;

        return new OrderDTO(order.getId(), userDTO, order.getPaymentMethod(), order.getTaxPrice(),
                order.getShippingPrice(), order.getTotalPrice(), order.getTypePay(), order.getIsPaid(),
                order.getPaidAt(), order.getIsDelivered(), order.getDeliveredAt(), order.getStatus(),
                order.getIsReceive(), orderItemDTOs, shippingAddressDTO, paymentResultDTO,
                order.getCreatedAt(), order.getUpdatedAt());
    }

}
