import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Strategy brand colors
const colors = {
  red: '#CC0000',
  darkGray: '#1F2937',
  mediumGray: '#4B5563',
  lightGray: '#9CA3AF',
  background: '#F9FAFB',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.darkGray,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: colors.red,
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkGray,
    marginBottom: 4,
  },
  companyMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  ticker: {
    backgroundColor: colors.darkGray,
    color: colors.white,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  industry: {
    color: colors.mediumGray,
    fontSize: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.red,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.darkGray,
  },
  insightRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  insightArrow: {
    color: colors.red,
    marginRight: 6,
    fontSize: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  themeContainer: {
    marginBottom: 12,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.red,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  themeName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.darkGray,
  },
  themeScore: {
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.red,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  subSectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.mediumGray,
    marginTop: 6,
    marginBottom: 3,
  },
  bulletList: {
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    color: colors.red,
    marginRight: 4,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  evidenceText: {
    fontSize: 8,
    color: colors.mediumGray,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  questionText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: colors.darkGray,
    marginBottom: 2,
  },
  competitiveBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 4,
  },
  competitiveText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: colors.lightGray,
  },
  personaBadge: {
    fontSize: 8,
    color: colors.white,
    backgroundColor: colors.mediumGray,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginLeft: 8,
  },
});

// Theme name mapping
const THEME_NAMES = {
  'governed-ai': 'Governed AI',
  'semantic-layer': 'Single Source of Truth',
  'trust-scale': 'Trust at Scale',
  'self-service': 'Self-Service Without Chaos',
  'time-to-insight': 'Time-to-Insight',
  'tco-consolidation': 'TCO / Consolidation',
  'controlled-costs': 'Controlled Costs',
  'portability-flexibility': 'Portability & Flexibility',
};

const ResearchPDF = ({ research, persona }) => {
  // Get top 3 themes sorted by relevance score
  const topThemes = Object.entries(research.themeFindings || {})
    .filter(([_, findings]) => findings && findings.relevanceScore > 0)
    .sort((a, b) => b[1].relevanceScore - a[1].relevanceScore)
    .slice(0, 3);

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{research.companyName}</Text>
          <View style={styles.companyMeta}>
            {research.ticker && <Text style={styles.ticker}>{research.ticker}</Text>}
            <Text style={styles.industry}>{research.industry}</Text>
            {persona && <Text style={styles.personaBadge}>{persona.name} View</Text>}
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.summary}>{research.summary}</Text>
        </View>

        {/* Key Insights */}
        {research.keyInsights && research.keyInsights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            {research.keyInsights.map((insight, idx) => (
              <View key={idx} style={styles.insightRow}>
                <Text style={styles.insightArrow}>→</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Themes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top GTM Themes</Text>
          {topThemes.map(([themeId, findings]) => (
            <View key={themeId} style={styles.themeContainer}>
              <View style={styles.themeHeader}>
                <Text style={styles.themeName}>{THEME_NAMES[themeId] || themeId}</Text>
                <Text style={styles.themeScore}>{findings.relevanceScore}% relevant</Text>
              </View>

              {/* Evidence */}
              {findings.evidence && findings.evidence.length > 0 && (
                <View>
                  <Text style={styles.subSectionTitle}>Evidence</Text>
                  {findings.evidence.slice(0, 2).map((item, idx) => (
                    <Text key={idx} style={styles.evidenceText}>
                      {item.source}: {item.text}
                    </Text>
                  ))}
                </View>
              )}

              {/* Talking Points */}
              {findings.talkingPoints && findings.talkingPoints.length > 0 && (
                <View>
                  <Text style={styles.subSectionTitle}>Talking Points</Text>
                  <View style={styles.bulletList}>
                    {findings.talkingPoints.slice(0, 2).map((point, idx) => (
                      <View key={idx} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Discovery Questions */}
              {findings.questions && findings.questions.length > 0 && (
                <View>
                  <Text style={styles.subSectionTitle}>Discovery Question</Text>
                  <Text style={styles.questionText}>"{findings.questions[0]}"</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Competitive Landscape */}
        {research.competitiveContext && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Competitive Landscape</Text>
            <View style={styles.competitiveBox}>
              <Text style={styles.competitiveText}>{research.competitiveContext}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Strategy Account Research</Text>
          <Text style={styles.footerText}>Generated {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
};

export const generatePDF = async (research, persona = null) => {
  const blob = await pdf(<ResearchPDF research={research} persona={persona} />).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Create filename from company name
  const safeCompanyName = research.companyName
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();

  link.download = `${safeCompanyName}_research_${new Date().toISOString().split('T')[0]}.pdf`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
};

export default ResearchPDF;
