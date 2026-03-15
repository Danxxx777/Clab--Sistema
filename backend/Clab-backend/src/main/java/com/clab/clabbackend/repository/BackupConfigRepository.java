package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.BackupConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface BackupConfigRepository extends JpaRepository<BackupConfig, Long> {

}