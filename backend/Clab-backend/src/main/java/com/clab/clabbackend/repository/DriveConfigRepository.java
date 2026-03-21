package com.clab.clabbackend.repository;

import com.clab.clabbackend.entities.DriveConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriveConfigRepository extends JpaRepository<DriveConfig, Long> {

}