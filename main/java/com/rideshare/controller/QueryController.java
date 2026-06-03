package com.rideshare.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rideshare.model.Query;
import com.rideshare.service.QueryService;

@RestController
@RequestMapping("/api/queries")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class QueryController {

    private final String uploadDir = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadScreenshot(@RequestParam("file") MultipartFile file) {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = path.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Autowired
    private QueryService queryService;

    @PostMapping
    public ResponseEntity<Query> submitQuery(@RequestBody Query query) {
        return ResponseEntity.ok(queryService.saveQuery(query));
    }

    @GetMapping
    public ResponseEntity<List<Query>> getAllQueries() {
        return ResponseEntity.ok(queryService.getAllQueries());
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Query> replyToQuery(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String response = payload.get("response");
        return ResponseEntity.ok(queryService.replyToQuery(id, response));
    }
}
