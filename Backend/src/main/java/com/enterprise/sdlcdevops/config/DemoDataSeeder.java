package com.enterprise.sdlcdevops.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    public DemoDataSeeder() {
    }

    @Override
    public void run(String... args) {
        log.info("Automatic sample data seeding is DISABLED. Database state is preserved as empty for manual data creation.");
    }
}
