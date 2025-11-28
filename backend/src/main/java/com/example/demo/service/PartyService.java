package com.example.demo.service;

import com.example.demo.controller.dto.PartyRequestDto;
import com.example.demo.repository.PartyRepository;
import com.example.demo.repository.entity.Party;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor

public class PartyService {
    private final PartyRepository partyRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public List<Party> getParties() {
        return partyRepository.findAll();
    }

    public Party createParty(PartyRequestDto request) {
        LocalDateTime meetTime = LocalDateTime.parse(request.getMeetTime(), formatter);

        Party party = Party.builder()
                .martName(request.getMartName())
                .title(request.getTitle())
                .meetTime(meetTime)
                .meetPlace(request.getMeetPlace())
                .maxMembers(request.getMaxMembers())
                .build();

        return partyRepository.save(party);
    }
}
