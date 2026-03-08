/**
 * Utility functions for plot formatting and display
 */

/**
 * Validates plot number format:
 * - Full plots: 1, 2, 3, 15, 100, etc.
 * - Half plots: 1A, 1B, 15A, 15B, etc.
 * Only A or B suffixes are allowed for half plots.
 */
export function isValidPlotNumber(plotNumber: string): boolean {
    if (!plotNumber) return false;
    const trimmed = plotNumber.trim();
    // Match: number only OR number followed by A or B (case insensitive)
    const pattern = /^[1-9]\d*[ABab]?$/;
    return pattern.test(trimmed);
}

/**
 * Checks if a plot number represents a half plot.
 * Half plots end with A or B (e.g., 1A, 1B, 15A, 15B).
 */
export function isHalfPlot(plotNumber: string): boolean {
    if (!plotNumber) return false;
    return /[ABab]$/.test(plotNumber.trim());
}

/**
 * Gets the plot type label based on the plot number.
 */
export function getPlotTypeLabel(plotNumber: string): string {
    return isHalfPlot(plotNumber) ? 'Half Plot' : 'Full Plot';
}

/**
 * Gets the base plot number (strips A/B suffixes).
 * e.g., "1A" -> "1", "15B" -> "15", "101" -> "101"
 */
export function getBasePlotNumber(plotNumber: string): string {
    if (!plotNumber) return "";
    const trimmed = plotNumber.trim();
    const match = trimmed.match(/^(\d+)[ABab]?$/);
    return match ? match[1] : trimmed;
}

/**
 * Gets recommended dimensions based on plot type.
 */
export function getDefaultDimensions(plotNumber: string): string {
    return isHalfPlot(plotNumber) ? '50ftx100ft' : '100ftx100ft';
}

/**
 * Formats a plot number with half-plot designation if applicable
 * @param plotNumber - The base plot number (e.g., "101")
 * @param isHalfPlotFlag - Whether this is a half plot
 * @param halfPlotDesignation - The half plot designation ('A' or 'B')
 * @returns Formatted plot number (e.g., "101A" or "101")
 */
export function formatPlotNumber(
    plotNumber: string,
    isHalfPlotFlag?: boolean,
    halfPlotDesignation?: string | null
): string {
    if (!plotNumber) return "";

    if (isHalfPlotFlag && halfPlotDesignation) {
        return `${plotNumber}${halfPlotDesignation}`;
    }

    return plotNumber;
}

/**
 * Parses a formatted plot number into its components
 * @param formattedPlotNumber - The formatted plot number (e.g., "101A")
 * @returns Object with plot number, isHalfPlot, and halfPlotDesignation
 */
export function parsePlotNumber(formattedPlotNumber: string): {
    plotNumber: string;
    isHalfPlot: boolean;
    halfPlotDesignation: string | null;
} {
    if (!formattedPlotNumber) {
        return {
            plotNumber: "",
            isHalfPlot: false,
            halfPlotDesignation: null,
        };
    }

    const match = formattedPlotNumber.trim().match(/^(\d+)([ABab])$/);

    if (match) {
        return {
            plotNumber: match[1],
            isHalfPlot: true,
            halfPlotDesignation: match[2].toUpperCase(),
        };
    }

    return {
        plotNumber: formattedPlotNumber.trim(),
        isHalfPlot: false,
        halfPlotDesignation: null,
    };
}

/**
 * Gets a display label for a plot
 * @param plotNumber - The base plot number
 * @param isHalfPlotFlag - Whether this is a half plot
 * @param halfPlotDesignation - The half plot designation
 * @param estateName - Optional estate name to include
 * @returns Display label (e.g., "Plot 101A" or "Plot 101 - City of David Estate")
 */
export function getPlotDisplayLabel(
    plotNumber: string,
    isHalfPlotFlag?: boolean,
    halfPlotDesignation?: string | null,
    estateName?: string
): string {
    const formattedNumber = formatPlotNumber(plotNumber, isHalfPlotFlag, halfPlotDesignation);
    const plotLabel = `Plot ${formattedNumber}`;

    if (estateName) {
        return `${plotLabel} - ${estateName}`;
    }

    return plotLabel;
}

/**
 * Type definition for plot data
 */
export type PlotData = {
    id: string;
    plot_number: string;
    is_half_plot?: boolean;
    half_plot_designation?: string | null;
    estate_id?: string;
    status?: string;
    dimensions?: string;
};

/**
 * Type definition for plot with estate data
 */
export type PlotWithEstate = PlotData & {
    estates?: {
        id: string;
        name: string;
    };
};

/**
 * Gets the formatted plot number from a plot object
 */
export function getFormattedPlotNumber(plot: PlotData): string {
    return formatPlotNumber(
        plot.plot_number,
        plot.is_half_plot,
        plot.half_plot_designation
    );
}
