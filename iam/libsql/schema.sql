CREATE TABLE `profiles` (
    `id` TEXT NOT NULL,
    `display` TEXT NOT NULL UNIQUE,
    `name` TEXT,
    `image` TEXT,
    --
    PRIMARY KEY (id)
);

CREATE TABLE `credentials` (
    `profile` TEXT NOT NULL,
    `login` TEXT NOT NULL UNIQUE,
    -- 
    FOREIGN KEY (profile) REFERENCES `profiles` (id),
    PRIMARY KEY (profile, login) 
);