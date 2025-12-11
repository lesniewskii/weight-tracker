import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from datetime import date

@pytest.mark.asyncio
async def test_get_measurements():
    mock_rows = [
        {
            "id": 1,
            "measurement_date": date(2023, 1, 15),
            "weight": 75.5,
            "notes": "Weekly check-in",
        }
    ]

    mock_connection = AsyncMock()
    mock_connection.fetch = AsyncMock(return_value=mock_rows)

    mock_acquire = MagicMock()
    mock_acquire.__aenter__.return_value = mock_connection
    mock_acquire.__aexit__.return_value = None

    with patch("measurements.database.pool.acquire", return_value=mock_acquire):
        from measurements import get_measurements

        result = await get_measurements(current_user={"id": 1})

        assert len(result["measurements"]) == 1
        assert result["measurements"][0]["weight"] == 75.5
        mock_connection.fetch.assert_called_once()


@pytest.mark.asyncio
async def test_add_measurement():
    from models import Measurement
    mock_measurement = Measurement(
        measurement_date='2023-01-15',
        weight=75.5,
        notes='Weekly check-in'
    )

    mock_connection = AsyncMock()
    mock_connection.execute = AsyncMock(return_value=None)

    mock_acquire = MagicMock()
    mock_acquire.__aenter__.return_value = mock_connection
    mock_acquire.__aexit__.return_value = None

    with patch("measurements.database.pool.acquire", return_value=mock_acquire):
        from measurements import add_measurement

        result = await add_measurement(mock_measurement, current_user={"id": 1})

        assert result == {"message": "Measurement added successfully"}
        mock_connection.execute.assert_called_once()


@pytest.mark.asyncio
async def test_add_measurement_invalid_date():
    from models import Measurement
    mock_measurement = Measurement(
        measurement_date='invalid-date',
        weight=75.5,
        notes='Weekly check-in'
    )

    from measurements import add_measurement

    # Assert that an HTTPException is raised for an invalid date
    with pytest.raises(HTTPException) as exc_info:
        await add_measurement(mock_measurement, current_user={"id": 1})

    assert exc_info.value.status_code == 400
