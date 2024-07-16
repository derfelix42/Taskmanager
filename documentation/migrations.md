# Manuel Migration Steps

## Migration of wakuep_times to sleep_history
Create new SQL table:
```sql
CREATE TABLE `j_tasks`.`sleep_history` (`ID` INT NOT NULL AUTO_INCREMENT , `start_time` TIMESTAMP NOT NULL , `stop_time` timestamp NULL DEFAULT NULL, PRIMARY KEY (`ID`)) ENGINE = InnoDB;
```

Convert old `wakeup_times` into new format:
```sql
INSERT INTO `sleep_history` (`start_time`, `stop_time`) SELECT TIMESTAMP(a.date, a.time) as start_time, TIMESTAMP(b.date, b.time) as stop_time FROM `wakeup_times` as a JOIN wakeup_times as b on a.date = DATE_SUB(b.date, INTERVAL 1 DAY) WHERE a.wake_up = 0 AND b.wake_up = 1 GROUP BY a.date, b.date ORDER BY a.date ASC;
```
