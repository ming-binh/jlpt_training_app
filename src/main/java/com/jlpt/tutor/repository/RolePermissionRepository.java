package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRole(Role role);
    Optional<RolePermission> findByRoleAndPermissionKey(Role role, String permissionKey);
}
