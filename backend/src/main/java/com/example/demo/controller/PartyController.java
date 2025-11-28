import com.example.demo.controller.dto.PartyRequestDto;
import com.example.demo.repository.entity.Party;
import com.example.demo.service.PartyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    @GetMapping
    public List<Party> list() {
        return partyService.getParties();
    }

    @PostMapping
    public Party create(@RequestBody PartyRequestDto request) {
        return partyService.createParty(request);
    }
}