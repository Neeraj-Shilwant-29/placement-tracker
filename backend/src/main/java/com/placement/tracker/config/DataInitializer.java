package com.placement.tracker.config;

import com.placement.tracker.entity.Company;
import com.placement.tracker.entity.AptitudeQuestion;
import com.placement.tracker.entity.CodingQuestion;
import com.placement.tracker.repository.CompanyRepository;
import com.placement.tracker.repository.AptitudeQuestionRepository;
import com.placement.tracker.repository.CodingQuestionRepository;
import com.placement.tracker.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataInitializer {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private AptitudeQuestionRepository aptitudeQuestionRepository;

    @Autowired
    private CodingQuestionRepository codingQuestionRepository;

    @Autowired
    private AuthService authService;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    @Transactional
    public void initializeData() {
        authService.initAdmin();
        initCompanies();
        initAptitudeQuestions();
        initCodingQuestions();
    }

    private void initCompanies() {
        if (companyRepository.count() == 0) {
            companyRepository.save(Company.builder()
                    .name("TCS").industry("IT Services").location("Pan India")
                    .packageOffered("3.36 - 7 LPA").minCgpa(6.0).minTenth(60).minTwelfth(60)
                    .eligibleBranches(Set.of("CSE", "IT", "ECE", "EEE", "ME", "CE"))
                    .description("Tata Consultancy Services - Leading IT services company").build());

            companyRepository.save(Company.builder()
                    .name("Infosys").industry("IT Services").location("Pan India")
                    .packageOffered("3.6 - 8 LPA").minCgpa(6.0).minTenth(60).minTwelfth(60)
                    .eligibleBranches(Set.of("CSE", "IT", "ECE", "EEE"))
                    .description("Infosys - Global leader in digital services").build());

            companyRepository.save(Company.builder()
                    .name("Wipro").industry("IT Services").location("Pan India")
                    .packageOffered("3.5 - 7 LPA").minCgpa(6.0).minTenth(60).minTwelfth(60)
                    .eligibleBranches(Set.of("CSE", "IT", "ECE"))
                    .description("Wipro - Technology services and consulting company").build());

            companyRepository.save(Company.builder()
                    .name("Google").industry("Technology").location("Bangalore, Hyderabad")
                    .packageOffered("15 - 30 LPA").minCgpa(7.5).minTenth(80).minTwelfth(80)
                    .eligibleBranches(Set.of("CSE", "IT"))
                    .description("Google - Leading technology company").build());

            companyRepository.save(Company.builder()
                    .name("Microsoft").industry("Technology").location("Hyderabad")
                    .packageOffered("12 - 25 LPA").minCgpa(7.5).minTenth(80).minTwelfth(80)
                    .eligibleBranches(Set.of("CSE", "IT"))
                    .description("Microsoft - Global technology corporation").build());

            companyRepository.save(Company.builder()
                    .name("Amazon").industry("E-Commerce/Technology").location("Hyderabad, Chennai")
                    .packageOffered("10 - 20 LPA").minCgpa(7.0).minTenth(75).minTwelfth(75)
                    .eligibleBranches(Set.of("CSE", "IT", "ECE"))
                    .description("Amazon - World's largest e-commerce company").build());

            System.out.println("Sample companies initialized!");
        }
    }

    private void initAptitudeQuestions() {
        if (aptitudeQuestionRepository.count() == 0) {
            aptitudeQuestionRepository.save(AptitudeQuestion.builder()
                    .question("What is 15% of 200?")
                    .optionA("25").optionB("30").optionC("35").optionD("40")
                    .correctAnswer("B").category("Quantitative").difficulty("Easy")
                    .explanation("15/100 * 200 = 30").build());

            aptitudeQuestionRepository.save(AptitudeQuestion.builder()
                    .question("If A can do a work in 10 days and B can do it in 15 days, how many days will they take together?")
                    .optionA("5").optionB("6").optionC("7").optionD("8")
                    .correctAnswer("B").category("Quantitative").difficulty("Medium")
                    .explanation("1/10 + 1/15 = 1/6, so 6 days").build());

            aptitudeQuestionRepository.save(AptitudeQuestion.builder()
                    .question("Choose the synonym of 'ABANDON'")
                    .optionA("Keep").optionB("Leave").optionC("Support").optionD("Build")
                    .correctAnswer("B").category("Verbal").difficulty("Easy")
                    .explanation("Abandon means to leave or give up").build());

            aptitudeQuestionRepository.save(AptitudeQuestion.builder()
                    .question("Find the odd one out: 2, 3, 5, 7, 11, 14, 17")
                    .optionA("2").optionB("7").optionC("14").optionD("17")
                    .correctAnswer("C").category("Logical").difficulty("Easy")
                    .explanation("14 is not a prime number").build());

            aptitudeQuestionRepository.save(AptitudeQuestion.builder()
                    .question("A train 100m long passes a pole in 20 seconds. What is its speed?")
                    .optionA("18 km/h").optionB("20 km/h").optionC("36 km/h").optionD("54 km/h")
                    .correctAnswer("C").category("Quantitative").difficulty("Medium")
                    .explanation("Speed = 100/20 = 5 m/s = 18 km/h").build());

            aptitudeQuestionRepository.save(AptitudeQuestion.builder()
                    .question("If FRIEND is coded as HUMJTK, how is CANDLE coded?")
                    .optionA("EDRIGL").optionB("DCNLFJ").optionC("EDRIGL").optionD("DCNLFJ")
                    .correctAnswer("A").category("Logical").difficulty("Hard")
                    .explanation("Each letter is shifted by +2").build());

            System.out.println("Sample aptitude questions initialized!");
        }
    }

    private void initCodingQuestions() {
        if (codingQuestionRepository.count() == 0) {
            codingQuestionRepository.save(CodingQuestion.builder()
                    .title("Two Sum")
                    .description("Given an array of integers and a target, find two numbers that add up to the target.")
                    .difficulty("Easy").category("Arrays")
                    .sampleInput("[2, 7, 11, 15], target = 9")
                    .sampleOutput("[0, 1]")
                    .constraints("1 <= nums.length <= 10^4").build());

            codingQuestionRepository.save(CodingQuestion.builder()
                    .title("Reverse a String")
                    .description("Write a function to reverse a given string.")
                    .difficulty("Easy").category("Strings")
                    .sampleInput("hello")
                    .sampleOutput("olleh")
                    .constraints("1 <= s.length <= 10^5").build());

            codingQuestionRepository.save(CodingQuestion.builder()
                    .title("Fibonacci Number")
                    .description("Find the nth Fibonacci number.")
                    .difficulty("Medium").category("Dynamic Programming")
                    .sampleInput("n = 6")
                    .sampleOutput("8")
                    .constraints("0 <= n <= 30").build());

            codingQuestionRepository.save(CodingQuestion.builder()
                    .title("Binary Search")
                    .description("Implement binary search to find a target in a sorted array.")
                    .difficulty("Easy").category("Searching")
                    .sampleInput("[1, 2, 3, 4, 5], target = 3")
                    .sampleOutput("2")
                    .constraints("1 <= nums.length <= 10^4").build());

            codingQuestionRepository.save(CodingQuestion.builder()
                    .title("Detect Cycle in Linked List")
                    .description("Detect if a linked list has a cycle.")
                    .difficulty("Medium").category("Linked Lists")
                    .sampleInput("[3, 2, 0, -4], pos = 1")
                    .sampleOutput("true")
                    .constraints("0 <= pos < length").build());

            codingQuestionRepository.save(CodingQuestion.builder()
                    .title("Longest Common Subsequence")
                    .description("Find the longest common subsequence of two strings.")
                    .difficulty("Hard").category("Dynamic Programming")
                    .sampleInput("abcde, ace")
                    .sampleOutput("3")
                    .constraints("1 <= text1.length, text2.length <= 1000").build());

            System.out.println("Sample coding questions initialized!");
        }
    }
}
