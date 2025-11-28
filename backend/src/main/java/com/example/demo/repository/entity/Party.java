package com.example.demo.repository.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

@Entity
@Table(name = "party")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Party {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 코스트코 / 트레이더스 지점명
    private String martName;

    // 모임 제목 (예: "토요일 2시 베이글/생수 팟")
    private String title;

    // 만나는 시간
    private LocalDateTime meetTime;

    // 만나는 장소 텍스트 (입구, 카트 보관소 등)
    private String meetPlace;

    // 최대 인원
    private Integer maxMembers;
}
