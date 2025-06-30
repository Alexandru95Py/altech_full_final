#!/bin/bash

# ALTech PDF - Version Restore Script

BACKUP_DIR="backups"
SRC_DIR="src"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to create backup
create_backup() {
    local backup_name=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/${backup_name}_${timestamp}"
    
    echo "Creating backup: $backup_path"
    cp -r $SRC_DIR/ $backup_path/
    echo "Backup created successfully!"
}

# Function to list backups
list_backups() {
    echo "Available backups:"
    ls -la $BACKUP_DIR/
}

# Function to restore from backup
restore_backup() {
    local backup_name=$1
    
    if [ -d "$BACKUP_DIR/$backup_name" ]; then
        echo "Restoring from: $backup_name"
        read -p "This will overwrite current src/. Continue? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf $SRC_DIR/
            cp -r "$BACKUP_DIR/$backup_name/" $SRC_DIR/
            echo "Restored successfully!"
        else
            echo "Restore cancelled."
        fi
    else
        echo "Backup not found: $backup_name"
        list_backups
    fi
}

# Main menu
case "$1" in
    "backup")
        create_backup $2
        ;;
    "restore")
        restore_backup $2
        ;;
    "list")
        list_backups
        ;;
    *)
        echo "Usage:"
        echo "  $0 backup <name>     - Create backup"
        echo "  $0 restore <name>    - Restore from backup"
        echo "  $0 list              - List available backups"
        echo ""
        echo "Examples:"
        echo "  $0 backup original_desktop"
        echo "  $0 backup before_responsive"
        echo "  $0 restore original_desktop"
        ;;
esac
