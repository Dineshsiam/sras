package com.sars.config;

import com.sars.entity.*;
import com.sars.entity.enums.EntryStatus;
import com.sars.entity.enums.Role;
import com.sars.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final OrganizationRepository orgRepository;
        private final PlaceRepository placeRepository;
        private final MachineRepository machineRepository;
        private final MetricRepository metricRepository;
        private final DataEntryRepository dataEntryRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                if (userRepository.count() > 0) {
                        log.info("Database already seeded. Skipping default data generation.");
                        return;
                }

                log.info("Injecting default seed data for visualization...");

                // 1. Create Default Users
                User admin = userRepository.save(User.builder()
                                .name("System Admin")
                                .email("admin@sars.com")
                                .password(passwordEncoder.encode("admin123"))
                                .role(Role.ADMIN)
                                .isActive(true)
                                .build());

                User manager = userRepository.save(User.builder()
                                .name("Facility Manager")
                                .email("manager@sars.com")
                                .password(passwordEncoder.encode("manager123"))
                                .role(Role.MANAGER)
                                .isActive(true)
                                .build());

                User analyst = userRepository.save(User.builder()
                                .name("Data Analyst")
                                .email("analyst@sars.com")
                                .password(passwordEncoder.encode("analyst123"))
                                .role(Role.ANALYST)
                                .isActive(true)
                                .build());

                // 2. Create Organization
                Organization org = orgRepository.save(Organization.builder()
                                .name("Global EcoCorp")
                                .description("Sample organization to visualize dashboard analytics.")
                                .build());

                admin.setOrganization(org);
                userRepository.save(admin);

                // 3. Create Places
                Place factory = placeRepository.save(Place.builder()
                                .name("North American Factory")
                                .location("New York, USA")
                                .organization(org)
                                .build());

                Place office = placeRepository.save(Place.builder()
                                .name("European Headquarters")
                                .location("Berlin, Germany")
                                .organization(org)
                                .build());

                // 4. Create Machines
                Machine generator = machineRepository.save(Machine.builder()
                                .name("HVAC System A")
                                .description("Main heating and cooling unit.")
                                .place(factory)
                                .build());

                Machine assembly = machineRepository.save(Machine.builder()
                                .name("Assembly Line 1")
                                .description("Primary manufacturing line.")
                                .place(factory)
                                .build());

                // 5. Create Metrics
                Metric energy = metricRepository.save(Metric.builder()
                                .name("Energy Consumption")
                                .unit("kWh")
                                .description("Electrical energy consumed")
                                .threshold(new BigDecimal("5000")) // Anomalies over 5000 kWh
                                .build());

                Metric emissions = metricRepository.save(Metric.builder()
                                .name("CO2 Emissions")
                                .unit("kg")
                                .description("Carbon dioxide released")
                                .build());

                Metric water = metricRepository.save(Metric.builder()
                                .name("Water Usage")
                                .unit("Liters")
                                .description("Industrial water consumed")
                                .build());

                // 6. Generate Dummy Data Entries (for charts!)
                Random random = new Random();
                LocalDateTime now = LocalDateTime.now();

                // Let's generate 40 entries spread out over the last 30 days
                for (int i = 0; i < 40; i++) {
                        LocalDateTime entryDate = now.minusDays(random.nextInt(30)).minusHours(random.nextInt(24));

                        // Randomly pick a place/machine and metric
                        Place p = random.nextBoolean() ? factory : office;
                        Machine m = (p == factory && random.nextBoolean()) ? assembly : generator;
                        Metric met = Arrays.asList(energy, emissions, water).get(random.nextInt(3));

                        // Generate a random value
                        double val = 500 + (2000 * random.nextDouble());

                        // Throw in an occasional anomaly!
                        if (random.nextInt(10) == 9 && met == energy)
                                val = 6000;

                        dataEntryRepository.save(DataEntry.builder()
                                        .value(new BigDecimal(val))
                                        .status(random.nextBoolean() ? EntryStatus.APPROVED : EntryStatus.PENDING)
                                        .place(p)
                                        .machine(m)
                                        .metric(met)
                                        .submittedBy(manager)
                                        .createdAt(entryDate)
                                        .build());
                }

                log.info("Default seed data injection complete! You can login with admin@sars.com / admin123");
        }
}
