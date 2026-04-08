package com.datn.drugstore.mapper;

import com.datn.drugstore.dto.OrderDTO;
import com.datn.drugstore.dto.OrderItemDTO;
import com.datn.drugstore.dto.PaymentResultDTO;
import com.datn.drugstore.dto.ShippingAddressDTO;
import com.datn.drugstore.entity.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public static OrderDTO toDTO(Order order) {
        if (order == null) {
            return null;
        }
        
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        
        if (order.getUser() != null) {
            dto.setUser(UserMapper.toDTO(order.getUser()));
        }
        
        if (order.getOrderItems() != null) {
            List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                    .map(item -> {
                        OrderItemDTO itemDTO = new OrderItemDTO();
                        itemDTO.setId(item.getId());
                        itemDTO.setName(item.getName());
                        itemDTO.setQty(item.getQty());
                        itemDTO.setImage(item.getImage());
                        itemDTO.setPrice(item.getPrice());
                        itemDTO.setLoanPrice(item.getLoanPrice());
                        if (item.getProduct() != null) {
                            itemDTO.setProduct(ProductMapper.toDTO(item.getProduct()));
                        }
                        return itemDTO;
                    })
                    .collect(Collectors.toList());
            dto.setOrderItems(orderItemDTOs);
        }
        
        if (order.getShippingAddress() != null) {
            ShippingAddressDTO shippingDTO = new ShippingAddressDTO();
            shippingDTO.setAddress(order.getShippingAddress().getAddress());
            shippingDTO.setCity(order.getShippingAddress().getCity());
            shippingDTO.setPostalCode(order.getShippingAddress().getPostalCode());
            shippingDTO.setCountry(order.getShippingAddress().getCountry());
            dto.setShippingAddress(shippingDTO);
        }
        
        if (order.getPaymentResult() != null) {
            PaymentResultDTO paymentDTO = new PaymentResultDTO();
            paymentDTO.setId(order.getPaymentResult().getId());
            paymentDTO.setStatus(order.getPaymentResult().getStatus());
            paymentDTO.setUpdateTime(order.getPaymentResult().getUpdateTime());
            paymentDTO.setEmailAddress(order.getPaymentResult().getEmailAddress());
            dto.setPaymentResult(paymentDTO);
        }
        
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setTypePay(order.getTypePay());
        dto.setTaxPrice(order.getTaxPrice());
        dto.setShippingPrice(order.getShippingPrice());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setIsPaid(order.getIsPaid());
        dto.setPaidAt(order.getPaidAt());
        dto.setIsDelivered(order.getIsDelivered());
        dto.setDeliveredAt(order.getDeliveredAt());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setStatus(order.getStatus());
        dto.setIsReceive(order.getIsReceive());
        
        return dto;
    }

    public static List<OrderDTO> toDTOList(List<Order> orders) {
        if (orders == null) {
            return null;
        }
        return orders.stream()
                .map(OrderMapper::toDTO)
                .collect(Collectors.toList());
    }
}
