import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from datetime import date

@pytest.mark.asyncio
async def test_get_measurements():
    mock_rows = [
        {
            "name": "John Doe",
            "measurement_date": date(2023, 1, 15),
            "weight": 75.5,
            "notes": "Weekly check-in"
        }
    ]

    # Mock connection and its fetch method
    mock_connection = AsyncMock()
    mock_connection.fetch = AsyncMock(return_value=mock_rows)

    # Mock the context manager for the database pool acquire
    mock_acquire = MagicMock()
    mock_acquire.__aenter__.return_value = mock_connection
    mock_acquire.__aexit__.return_value = None

    # Patch the exact path of pool.acquire used in the code under test
    with patch('measurements.get_measurements.pool.acquire', return_value=mock_acquire):
        from measurements import get_measurements
        result = await get_measurements()

        # Assertions
        assert len(result['measurements']) == 1
        assert result['measurements'][0]['name'] == 'John Doe'
        assert result['measurements'][0]['weight'] == 75.5

        # Ensure fetch was called once
        mock_connection.fetch.assert_called_once()


@pytest.mark.asyncio
async def test_add_measurement():
    from models import Measurement
    mock_measurement = Measurement(
        user_id=1,
        measurement_date='2023-01-15',
        weight=75.5,
        notes='Weekly check-in'
    )

    # Mock connection and its execute method
    mock_connection = AsyncMock()
    mock_connection.execute = AsyncMock(return_value=None)

    # Mock the context manager for the database pool acquire
    mock_acquire = MagicMock()
    mock_acquire.__aenter__.return_value = mock_connection
    mock_acquire.__aexit__.return_value = None

    # Patch the exact path of pool.acquire used in the code under test
    with patch('measurements.add_measurement.pool.acquire', return_value=mock_acquire):
        from measurements import add_measurement
        result = await add_measurement(mock_measurement)

        # Assertions
        assert result == {"message": "Measurement added successfully"}

        # Ensure execute was called once
        mock_connection.execute.assert_called_once()


@pytest.mark.asyncio
async def test_add_measurement_invalid_date():
    from models import Measurement
    mock_measurement = Measurement(
        user_id=1,
        measurement_date='invalid-date',
        weight=75.5,
        notes='Weekly check-in'
    )

    from measurements import add_measurement

    # Assert that an HTTPException is raised for an invalid date
    with pytest.raises(HTTPException) as exc_info:
        await add_measurement(mock_measurement)

    assert exc_info.value.status_code == 400
