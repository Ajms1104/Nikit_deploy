package com.example.demo.controller.settlement;

import com.example.demo.controller.settlement.dto.SettlementRequest;
import com.example.demo.controller.settlement.dto.SettlementResponse;
import com.example.demo.global.common.ApiResponse;
import com.example.demo.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parties/{partyId}/settlement")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    // 정산 및 결과 조회
    // (POST로 요청하면서 실제 가격 정보를 보내면, 계산 결과를 반환)
    @PostMapping
    public ApiResponse<List<SettlementResponse>> calculate(@PathVariable Long partyId,
        @RequestBody SettlementRequest request) {
        return ApiResponse.success(settlementService.calculate(partyId, request));
    }
}
