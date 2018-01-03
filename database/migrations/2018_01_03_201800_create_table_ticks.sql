CREATE TABLE `ticks` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`date` DATETIME NOT NULL,
	`market` VARCHAR(10) NOT NULL,
	`last` INT(32) NOT NULL,
	`bid` INT(32) NOT NULL,
	`ask` INT(32) NOT NULL,
    PRIMARY KEY (id)
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
;
