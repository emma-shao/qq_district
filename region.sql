CREATE TABLE `qq_districts` (
  `id` int(11) NOT NULL COMMENT '行政区划唯一标识',
  `name` varchar(16) NOT NULL COMMENT '简称，如“内蒙古”',
  `fullname` varchar(22) NOT NULL COMMENT '全称，如“内蒙古自治区”',
  `pinyin` varchar(55) DEFAULT NULL COMMENT '行政区划拼音',
  `lat` decimal(13,10) NOT NULL COMMENT '中心点坐标 纬度',
  `lng` decimal(13,10) NOT NULL COMMENT '中心点坐标 经度',
  `layer` tinyint(4) NOT NULL COMMENT '层级',
  `parent_id` int(11) NOT NULL COMMENT '父级行政区划id',
  `letter` char(1) DEFAULT NULL COMMENT '首字母',
  `version` varchar(8) NOT NULL COMMENT '版本号',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
