"""
Centralized logging module for Anamalia Prompt Assembler.

Provides consistent logging across all CLI commands with file output,
timestamps, and proper error handling.
"""

import logging
import os
import sys
from datetime import datetime
from pathlib import Path


def setup_logger(name: str = "pa", log_level: str = "INFO") -> logging.Logger:
    """
    Set up centralized logger with file output and console output.
    
    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    # Create logs directory if it doesn't exist
    logs_dir = Path(__file__).parent.parent / "logs"
    logs_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Create formatters
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_formatter = logging.Formatter(
        '%(levelname)s: %(message)s'
    )
    
    # File handler
    log_file = logs_dir / f"pa_{timestamp}.log"
    file_handler = logging.FileHandler(log_file, mode='w', encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # Prevent duplicate logs
    logger.propagate = False
    
    return logger


def get_logger(name: str = "pa") -> logging.Logger:
    """
    Get existing logger or create new one.
    
    Args:
        name: Logger name
    
    Returns:
        Logger instance
    """
    return logging.getLogger(name)


class LoggerMixin:
    """
    Mixin class to add logging capabilities to CLI commands.
    """
    
    def __init__(self):
        self.logger = get_logger()
    
    def log_info(self, message: str):
        """Log info message."""
        self.logger.info(message)
    
    def log_warning(self, message: str):
        """Log warning message."""
        self.logger.warning(message)
    
    def log_error(self, message: str):
        """Log error message."""
        self.logger.error(message)
    
    def log_debug(self, message: str):
        """Log debug message."""
        self.logger.debug(message)


def log_command_start(command_name: str, args: dict = None):
    """
    Log the start of a CLI command.
    
    Args:
        command_name: Name of the command being executed
        args: Optional dictionary of command arguments
    """
    logger = get_logger()
    logger.info(f"Starting command: {command_name}")
    if args:
        logger.debug(f"Command arguments: {args}")


def log_command_end(command_name: str, success: bool = True, message: str = None):
    """
    Log the end of a CLI command.
    
    Args:
        command_name: Name of the command
        success: Whether the command succeeded
        message: Optional message to include
    """
    logger = get_logger()
    status = "completed successfully" if success else "failed"
    log_message = f"Command {command_name} {status}"
    if message:
        log_message += f": {message}"
    
    if success:
        logger.info(log_message)
    else:
        logger.error(log_message)


def log_validation_error(asset_type: str, asset_id: str, error: str):
    """
    Log validation errors with consistent format.
    
    Args:
        asset_type: Type of asset being validated
        asset_id: ID of the asset
        error: Error message
    """
    logger = get_logger()
    logger.error(f"Validation error in {asset_type} '{asset_id}': {error}")


def log_conversion_progress(asset_type: str, total: int, current: int):
    """
    Log conversion progress.
    
    Args:
        asset_type: Type of asset being converted
        total: Total number of assets
        current: Current asset number
    """
    logger = get_logger()
    percentage = (current / total) * 100 if total > 0 else 0
    logger.info(f"Converting {asset_type}: {current}/{total} ({percentage:.1f}%)")


def log_bundle_creation(bundle_id: str, output_path: str):
    """
    Log bundle creation.
    
    Args:
        bundle_id: ID of the created bundle
        output_path: Path where bundle was saved
    """
    logger = get_logger()
    logger.debug(f"Created bundle {bundle_id} -> {output_path}")


def log_rendering_progress(bundle_id: str, status: str):
    """
    Log rendering progress.
    
    Args:
        bundle_id: ID of the bundle being rendered
        status: Current rendering status
    """
    logger = get_logger()
    logger.info(f"Rendering {bundle_id}: {status}")


def log_drift_check(bundle_id: str, drift_score: float, threshold: float):
    """
    Log drift check results.
    
    Args:
        bundle_id: ID of the bundle
        drift_score: Calculated drift score
        threshold: Drift threshold
    """
    logger = get_logger()
    status = "PASS" if drift_score <= threshold else "FAIL"
    logger.info(f"Drift check {bundle_id}: {drift_score:.3f} (threshold: {threshold:.3f}) - {status}")


# Initialize default logger
default_logger = setup_logger()
