package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}
