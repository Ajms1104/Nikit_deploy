package com.example.demo.controller.shopping.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class VoteRequest {
    private Long userId;
    private boolean agree; // true: 찬성, false: 반대
}
